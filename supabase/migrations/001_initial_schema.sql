-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  photo_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create game_rooms table
CREATE TABLE game_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type TEXT NOT NULL CHECK (game_type IN ('death_space', 'munchkin')),
  name TEXT NOT NULL,
  description TEXT,
  max_players INTEGER NOT NULL,
  current_players INTEGER DEFAULT 0,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'finished')),
  settings JSONB NOT NULL DEFAULT '{}',
  game_state JSONB NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create room_players table
CREATE TABLE room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  player_data JSONB NOT NULL DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_ready BOOLEAN DEFAULT FALSE,
  UNIQUE(room_id, user_id)
);

-- Create game_actions table
CREATE TABLE game_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'chat' CHECK (message_type IN ('chat', 'system', 'action')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_game_type ON game_rooms(game_type);
CREATE INDEX idx_room_players_room_id ON room_players(room_id);
CREATE INDEX idx_room_players_user_id ON room_players(user_id);
CREATE INDEX idx_game_actions_room_id ON game_actions(room_id);
CREATE INDEX idx_game_actions_processed ON game_actions(processed);
CREATE INDEX idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for game_rooms table
CREATE POLICY "Anyone can view game rooms" ON game_rooms
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create game rooms" ON game_rooms
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room creators can update their rooms" ON game_rooms
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Room creators can delete their rooms" ON game_rooms
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for room_players table
CREATE POLICY "Anyone can view room players" ON room_players
  FOR SELECT USING (true);

CREATE POLICY "Users can join rooms" ON room_players
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own player data" ON room_players
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can leave rooms" ON room_players
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for game_actions table
CREATE POLICY "Room players can view actions" ON game_actions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_players 
      WHERE room_players.room_id = game_actions.room_id 
      AND room_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Room players can create actions" ON game_actions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM room_players 
      WHERE room_players.room_id = game_actions.room_id 
      AND room_players.user_id = auth.uid()
    )
  );

-- RLS Policies for chat_messages table
CREATE POLICY "Room players can view messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_players 
      WHERE room_players.room_id = chat_messages.room_id 
      AND room_players.user_id = auth.uid()
    )
  );

CREATE POLICY "Room players can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM room_players 
      WHERE room_players.room_id = chat_messages.room_id 
      AND room_players.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_rooms_updated_at BEFORE UPDATE ON game_rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update current_players count
CREATE OR REPLACE FUNCTION update_room_player_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE game_rooms 
    SET current_players = current_players + 1 
    WHERE id = NEW.room_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE game_rooms 
    SET current_players = current_players - 1 
    WHERE id = OLD.room_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers to automatically update player count
CREATE TRIGGER update_player_count_on_join AFTER INSERT ON room_players
  FOR EACH ROW EXECUTE FUNCTION update_room_player_count();

CREATE TRIGGER update_player_count_on_leave AFTER DELETE ON room_players
  FOR EACH ROW EXECUTE FUNCTION update_room_player_count();