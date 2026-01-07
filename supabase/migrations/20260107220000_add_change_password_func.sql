create or replace function changepassword("current_plain_password" text, "new_plain_password" text, "current_id" uuid)
returns varchar
language plpgsql
security definer
as $$
DECLARE
encpass auth.users.encrypted_password%type;
BEGIN
  SELECT encrypted_password
  FROM auth.users
  INTO encpass
  WHERE id = current_id and encrypted_password = crypt(current_plain_password, auth.users.encrypted_password);

  -- Check the currect password and update
  IF NOT FOUND THEN
    return 'incorrect';
  else
    UPDATE auth.users SET encrypted_password = crypt(new_plain_password, gen_salt('bf')) WHERE id = current_id;
    return 'success';
  END IF;

END;
$$;
