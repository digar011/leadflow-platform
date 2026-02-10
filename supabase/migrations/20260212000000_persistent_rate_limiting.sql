-- Persistent rate limiting table (replaces in-memory LRU cache)
-- Works across serverless instances and survives restarts

CREATE TABLE IF NOT EXISTS public.rate_limit_entries (
  identifier TEXT NOT NULL,
  request_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limit_lookup
  ON public.rate_limit_entries (identifier, request_time DESC);

-- Atomic check-and-record function
-- Returns: allowed (boolean), remaining (int)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_limit INT DEFAULT 60,
  p_window_seconds INT DEFAULT 60
) RETURNS TABLE(allowed BOOLEAN, remaining INT) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
BEGIN
  v_window_start := now() - make_interval(secs => p_window_seconds);

  -- Clean up old entries for this identifier
  DELETE FROM public.rate_limit_entries
  WHERE identifier = p_identifier AND request_time < v_window_start;

  -- Count requests in current window
  SELECT count(*) INTO v_count
  FROM public.rate_limit_entries
  WHERE identifier = p_identifier AND request_time >= v_window_start;

  IF v_count >= p_limit THEN
    RETURN QUERY SELECT false, 0;
    RETURN;
  END IF;

  -- Record this request
  INSERT INTO public.rate_limit_entries (identifier, request_time)
  VALUES (p_identifier, now());

  RETURN QUERY SELECT true, (p_limit - v_count - 1);
END;
$$;

-- Global cleanup function (call periodically or via pg_cron)
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.rate_limit_entries
  WHERE request_time < now() - interval '5 minutes';
END;
$$;

-- No RLS on rate_limit_entries — only accessed via service role / SECURITY DEFINER functions
ALTER TABLE public.rate_limit_entries ENABLE ROW LEVEL SECURITY;
