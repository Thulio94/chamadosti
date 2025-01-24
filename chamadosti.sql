

CREATE TABLE IF NOT EXISTS public.users
(
    id uuid NOT NULL,
    name text COLLATE pg_catalog."default" NOT NULL,
    email text COLLATE pg_catalog."default" NOT NULL,
    role text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    password text COLLATE pg_catalog."default",
    status boolean,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_role_check CHECK (role = ANY (ARRAY['admin'::text, 'ti'::text, 'usuario'::text]))
)



CREATE TABLE IF NOT EXISTS public.comments
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    ticket_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_ticket_id_fkey FOREIGN KEY (ticket_id)
        REFERENCES public.tickets (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)


CREATE TABLE IF NOT EXISTS public.evolution_api_config
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    server_url text COLLATE pg_catalog."default" NOT NULL,
    api_key text COLLATE pg_catalog."default" NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT evolution_api_config_pkey PRIMARY KEY (id)
)



CREATE TABLE IF NOT EXISTS public.tickets
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    title text COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    status text COLLATE pg_catalog."default" NOT NULL,
    user_id uuid NOT NULL,
    ti_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT tickets_pkey PRIMARY KEY (id),
    CONSTRAINT tickets_ti_id_fkey FOREIGN KEY (ti_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tickets_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES public.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT tickets_status_check CHECK (status = ANY (ARRAY['aberto'::text, 'em_processo'::text, 'fechado'::text, 'reaberto'::text]))
)


    