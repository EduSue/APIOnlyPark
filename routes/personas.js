const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const router = express.Router();

const supabaseUrl = 'https://sjuheulhzjwkvnglfeif.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Ruta GET para obtener todas las personas
router.get('/personas', async (req, res) => {
    try {
        const { data, error } = await supabase.from('personas').select('*');
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta POST para crear una nueva persona
router.post('/personas', async (req, res) => {
    const { nombre, apellidos, telefono, correo, imagen_perfil, rol } = req.body;
    try {
        const { data, error } = await supabase.from('personas').insert([
            { nombre, apellidos, telefono, correo, imagen_perfil, rol }
        ]);
        if (error) {
            throw error;
        }
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
