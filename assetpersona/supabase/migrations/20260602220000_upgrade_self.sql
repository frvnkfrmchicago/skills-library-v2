-- Migrations: 20260602220000_upgrade_self.sql
-- Ingestion store for Upgrade.Self documents

CREATE TABLE IF NOT EXISTS public.upgrade_self_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_size INT NOT NULL,
    parsed_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.upgrade_self_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID REFERENCES public.upgrade_self_sources(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    label TEXT NOT NULL,
    details TEXT,
    level INT NOT NULL,
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.upgrade_self_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upgrade_self_nodes ENABLE ROW LEVEL SECURITY;

-- Policies for sources
CREATE POLICY "Users can insert their own sources" 
    ON public.upgrade_self_sources 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sources" 
    ON public.upgrade_self_sources 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sources" 
    ON public.upgrade_self_sources 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Policies for nodes
CREATE POLICY "Users can insert their own nodes" 
    ON public.upgrade_self_nodes 
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.upgrade_self_sources 
            WHERE id = source_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own nodes" 
    ON public.upgrade_self_nodes 
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.upgrade_self_sources 
            WHERE id = source_id AND user_id = auth.uid()
        )
    );
