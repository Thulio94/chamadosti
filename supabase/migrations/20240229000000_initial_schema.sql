-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'ti', 'usuario')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tickets table
CREATE TABLE tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('aberto', 'em_processo', 'fechado', 'reaberto')),
    user_id UUID REFERENCES users(id) NOT NULL,
    ti_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for tickets table
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data and admins can view all"
    ON users FOR SELECT
    USING (
        auth.uid() = id
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'ti')
        )
    );

CREATE POLICY "Tickets are viewable by creator and assigned TI"
    ON tickets FOR SELECT
    USING (
        auth.uid() = user_id
        OR auth.uid() = ti_id
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'ti')
        )
    );

CREATE POLICY "Comments are viewable by ticket participants"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tickets
            WHERE tickets.id = ticket_id
            AND (
                tickets.user_id = auth.uid()
                OR tickets.ti_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'ti')
                )
            )
        )
    );

-- Create initial admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'admin@sistema.com',
    crypt('123456', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
);

INSERT INTO users (id, name, email, role)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Administrador',
    'admin@sistema.com',
    'admin'
);