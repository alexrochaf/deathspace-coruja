-- Verificar salas de Munchkin disponíveis
SELECT 
    gr.id,
    gr.name,
    gr.status,
    gr.current_players,
    gr.max_players,
    gr.created_at,
    gr.created_by
FROM game_rooms gr
WHERE gr.game_type = 'munchkin'
ORDER BY gr.created_at DESC;

-- Verificar jogadores em salas
SELECT 
    rp.room_id,
    rp.user_id,
    rp.joined_at,
    rp.is_ready,
    gr.name as room_name,
    gr.status as room_status
FROM room_players rp
JOIN game_rooms gr ON rp.room_id = gr.id
WHERE gr.game_type = 'munchkin'
ORDER BY rp.joined_at DESC;

-- Verificar se há jogadores órfãos (em salas que não existem mais)
SELECT 
    rp.room_id,
    rp.user_id,
    rp.joined_at
FROM room_players rp
LEFT JOIN game_rooms gr ON rp.room_id = gr.id
WHERE gr.id IS NULL;