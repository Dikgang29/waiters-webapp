create database waiters_app;
create role waiter_admin login password 'waiters';
grant all privileges on database waiters_app to waiter_admin;


GRANT ALL PRIVILEGES on TABLE register_table TO waiter_admin;
GRANT ALL PRIVILEGES on SEQUENCES register_table_id_seq TO waiter_admin;