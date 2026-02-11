-- Temporarily disable the column protection trigger to set subscription tier
ALTER TABLE profiles DISABLE TRIGGER protect_profile_columns_trigger;

UPDATE profiles
SET subscription_tier = 'enterprise'
WHERE email = 'diego.j.garnica@gmail.com';

ALTER TABLE profiles ENABLE TRIGGER protect_profile_columns_trigger;
