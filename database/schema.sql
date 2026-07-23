-- Enable UUID Extension
create extension if not exists "pgcrypto";

---------------------------------------------------------
-- USERS
---------------------------------------------------------

create table users (

    id uuid primary key default gen_random_uuid(),

    name varchar(100) not null,

    email varchar(120) unique not null,

    phone varchar(20),

    password_hash text not null,

    role varchar(20) not null
        check (role in ('admin','driver','passenger')),

    created_at timestamp default current_timestamp

);

---------------------------------------------------------
-- DRIVERS
---------------------------------------------------------

create table drivers (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references users(id) on delete cascade,

    license_number varchar(50) unique,

    availability_status varchar(20) default 'available',

    created_at timestamp default current_timestamp

);

---------------------------------------------------------
-- VEHICLES
---------------------------------------------------------

create table vehicles (

    id uuid primary key default gen_random_uuid(),

    vehicle_number varchar(30) unique not null,

    vehicle_type varchar(30),

    capacity integer,

    status varchar(20) default 'active',

    driver_id uuid references drivers(id),

    created_at timestamp default current_timestamp

);

---------------------------------------------------------
-- ROUTES
---------------------------------------------------------

create table routes (

    id uuid primary key default gen_random_uuid(),

    route_name varchar(120),

    source varchar(120),

    destination varchar(120),

    distance decimal,

    estimated_time integer

);

---------------------------------------------------------
-- STOPS
---------------------------------------------------------

create table stops (

    id uuid primary key default gen_random_uuid(),

    route_id uuid references routes(id) on delete cascade,

    stop_name varchar(120),

    latitude decimal,

    longitude decimal,

    stop_order integer

);

---------------------------------------------------------
-- TRIPS
---------------------------------------------------------

create table trips (

    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid references vehicles(id),

    route_id uuid references routes(id),

    driver_id uuid references drivers(id),

    start_time timestamp,

    end_time timestamp,

    status varchar(20)

);

---------------------------------------------------------
-- VEHICLE LOCATIONS
---------------------------------------------------------

create table vehicle_locations (

    id uuid primary key default gen_random_uuid(),

    vehicle_id uuid references vehicles(id),

    latitude decimal,

    longitude decimal,

    speed decimal,

    recorded_at timestamp default current_timestamp

);

---------------------------------------------------------
-- ETA PREDICTIONS
---------------------------------------------------------

create table eta_predictions (

    id uuid primary key default gen_random_uuid(),

    trip_id uuid references trips(id),

    current_location varchar(120),

    predicted_time integer,

    actual_time integer,

    accuracy decimal,

    created_at timestamp default current_timestamp

);

---------------------------------------------------------
-- NOTIFICATIONS
---------------------------------------------------------

create table notifications (

    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),

    title varchar(150),

    message text,

    type varchar(30),

    is_read boolean default false,

    created_at timestamp default current_timestamp

);

---------------------------------------------------------
-- FEEDBACK
---------------------------------------------------------

create table feedback (

    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),

    rating integer,

    comments text,

    created_at timestamp default current_timestamp

);