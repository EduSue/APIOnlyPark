import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import cors from "cors";


dotenv.config();

const app = express();
const supabaseUrl = 'https://sjuheulhzjwkvnglfeif.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(cors())







// Ruta GET para obtener todos los usuarios por tipo
app.get('/api/personas/:tipo', async (req, res) => {
    const tipoUsuario = req.params.tipo;

    try {
        // Consultar todos los usuarios por tipo
        const { data: usuarios, error } = await supabase
            .from('personas')
            .select('*')
            .eq('rol', tipoUsuario);
        if (error) {
            throw error;
        }

        // Si no hay usuarios del tipo especificado, devolver un mensaje
        if (!usuarios || usuarios.length === 0) {
            return res.status(404).json({ message: `No se encontraron usuarios con el tipo '${tipoUsuario}'` });
        }

        // Devolver los usuarios encontrados
        res.status(200).json({ usuarios });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta GET para obtener todas las personas
app.get('/api/personas', async (req, res) => {
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



// Ruta POST para agregar una nueva persona
app.post('/api/personas', async (req, res) => {
    const { nombre, apellidos, telefono, correo, imagen_perfil, rol, password, usuario, estado } = req.body;
    try {
        // Insertar la nueva persona en la tabla de personas
        const { data: nuevaPersona, error } = await supabase
            .from('personas')
            .insert({ nombre, apellidos, telefono, correo, imagen_perfil, rol, password, usuario, estado })
            .single();
        if (error) {
            throw error;
        }

        res.status(201).json({ persona: nuevaPersona });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta PUT para actualizar una persona
app.put('/api/personas/:id', async (req, res) => {
    const id = req.params.id;
    const { nombre, apellidos, telefono, correo, imagen_perfil, rol } = req.body;
    try {
        const { data, error } = await supabase
            .from('personas')
            .update({ nombre, apellidos, telefono, correo, imagen_perfil, rol })
            .eq('id_persona', id);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});












//Garajes
// Ruta GET para obtener todos los garajes
app.get('/api/garajes', async (req, res) => {
    try {
        const { data, error } = await supabase.from('garajes').select('*');
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Ruta POST para crear un nuevo garaje
app.post('/api/garajes', async (req, res) => {
    const { capacidad, latitud, longitud, direccion, descripcion, ciudad, imagen_referencia, monto_hora, monto_sancion, flag, id_propietario } = req.body;
    try {
        const { data, error } = await supabase.from('garajes').insert([
            { capacidad, latitud, longitud, direccion, descripcion, ciudad, imagen_referencia, monto_hora, monto_sancion, flag, id_propietario }
        ]);
        if (error) {
            throw error;
        }
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta PUT para actualizar un garaje
app.put('/api/garajes/:id', async (req, res) => {
    const id = req.params.id;
    const { capacidad, latitud, longitud, direccion, descripcion, ciudad, imagen_referencia, monto_hora, monto_sancion, flag, id_propietario } = req.body;
    try {
        const { data, error } = await supabase
            .from('garajes')
            .update({ capacidad, latitud, longitud, direccion, descripcion, ciudad, imagen_referencia, monto_hora, monto_sancion, flag, id_propietario })
            .eq('id_garaje', id);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});










//Espacios
// Ruta GET para obtener todos los espacios de un garaje en específico
app.get('/api/garajes/:id/espacios', async (req, res) => {
    const idGaraje = req.params.id;
    try {
        const { data, error } = await supabase
            .from('espacios')
            .select('*')
            .eq('id_garaje', idGaraje);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta POST para agregar un nuevo espacio a un garaje
app.post('/api/garajes/:id/espacios', async (req, res) => {
    const idGaraje = req.params.id;
    const { tipo_espacio, flag } = req.body;
    try {
        // Insertar el nuevo espacio en la tabla de espacios
        const { data: espacioData, error: espacioError } = await supabase
            .from('espacios')
            .insert({ id_garaje: idGaraje, tipo_espacio, flag });
        if (espacioError) {
            throw espacioError;
        }

        // Obtener la capacidad actual del garaje
        const { data: garajeData, error: garajeError } = await supabase
            .from('garajes')
            .select('capacidad')
            .eq('id_garaje', idGaraje)
            .single();
        if (garajeError) {
            throw garajeError;
        }

        // Incrementar la capacidad del garaje en 1
        const nuevaCapacidad = garajeData.capacidad + 1;

        // Actualizar la capacidad del garaje en la base de datos
        const { data: updateData, error: updateError } = await supabase
            .from('garajes')
            .update({ capacidad: nuevaCapacidad })
            .eq('id_garaje', idGaraje);
        if (updateError) {
            throw updateError;
        }

        res.status(201).json({ espacio: espacioData, nuevaCapacidad });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta PUT para desactivar un espacio (flag = 0) y disminuir la capacidad del garaje en uno
app.put('/api/espacios/:id/desactivar', async (req, res) => {
    const idEspacio = req.params.id;
    try {
        // Obtener el espacio y su garaje asociado
        const { data: espacioData, error: espacioError } = await supabase
            .from('espacios')
            .select('id_garaje')
            .eq('id_espacio', idEspacio)
            .single();
        if (espacioError) {
            throw espacioError;
        }

        // Desactivar el espacio (flag = 0)
        const { data: updateData, error: updateError } = await supabase
            .from('espacios')
            .update({ flag: 0 })
            .eq('id_espacio', idEspacio);
        if (updateError) {
            throw updateError;
        }

        // Obtener la capacidad actual del garaje asociado al espacio
        const { data: garajeData, error: garajeError } = await supabase
            .from('garajes')
            .select('capacidad')
            .eq('id_garaje', espacioData.id_garaje)
            .single();
        if (garajeError) {
            throw garajeError;
        }

        // Disminuir la capacidad del garaje en 1
        const nuevaCapacidad = garajeData.capacidad - 1;

        // Actualizar la capacidad del garaje en la base de datos
        const { data: updateGarajeData, error: updateGarajeError } = await supabase
            .from('garajes')
            .update({ capacidad: nuevaCapacidad })
            .eq('id_garaje', espacioData.id_garaje);
        if (updateGarajeError) {
            throw updateGarajeError;
        }

        res.json({ espacio: espacioData, nuevaCapacidad });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Ruta PUT para habilitar un espacio (flag = 1) y aumentar la capacidad del garaje en uno
app.put('/api/espacios/:id/habilitar', async (req, res) => {
    const idEspacio = req.params.id;
    try {
        // Obtener el espacio y su garaje asociado
        const { data: espacioData, error: espacioError } = await supabase
            .from('espacios')
            .select('id_garaje')
            .eq('id_espacio', idEspacio)
            .single();
        if (espacioError) {
            throw espacioError;
        }

        // Habilitar el espacio (flag = 1)
        const { data: updateData, error: updateError } = await supabase
            .from('espacios')
            .update({ flag: 1 })
            .eq('id_espacio', idEspacio);
        if (updateError) {
            throw updateError;
        }

        // Obtener la capacidad actual del garaje asociado al espacio
        const { data: garajeData, error: garajeError } = await supabase
            .from('garajes')
            .select('capacidad')
            .eq('id_garaje', espacioData.id_garaje)
            .single();
        if (garajeError) {
            throw garajeError;
        }

        // Aumentar la capacidad del garaje en 1
        const nuevaCapacidad = garajeData.capacidad + 1;

        // Actualizar la capacidad del garaje en la base de datos
        const { data: updateGarajeData, error: updateGarajeError } = await supabase
            .from('garajes')
            .update({ capacidad: nuevaCapacidad })
            .eq('id_garaje', espacioData.id_garaje);
        if (updateGarajeError) {
            throw updateGarajeError;
        }

        res.json({ espacio: espacioData, nuevaCapacidad });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});





// Vehivulos
// Ruta GET para obtener todos los vehículos
app.get('/api/vehiculos', async (req, res) => {
    try {
        const { data: vehiculosData, error } = await supabase
            .from('vehiculos')
            .select('*');
        if (error) {
            throw error;
        }
        res.json({ vehiculos: vehiculosData });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Ruta POST para agregar un nuevo vehículo
app.post('/api/vehiculos', async (req, res) => {
    const { id_persona, tipo_vehiculo, placa } = req.body;
    try {
        const { data: nuevoVehiculo, error } = await supabase
            .from('vehiculos')
            .insert({ id_persona, tipo_vehiculo, placa })
            .single();
        if (error) {
            throw error;
        }
        res.status(201).json({ vehiculo: nuevoVehiculo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Ruta PUT para actualizar un vehículo
app.put('/api/vehiculos/:id', async (req, res) => {
    const idVehiculo = req.params.id;
    const { id_persona, tipo_vehiculo, placa } = req.body;
    try {
        const { data, error } = await supabase
            .from('vehiculos')
            .update({ id_persona, tipo_vehiculo, placa })
            .eq('id_vehiculo', idVehiculo);
        if (error) {
            throw error;
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta DELETE para eliminar un vehículo
app.delete('/api/vehiculos/:id', async (req, res) => {
    const idVehiculo = req.params.id;
    try {
        const { data, error } = await supabase
            .from('vehiculos')
            .delete()
            .eq('id_vehiculo', idVehiculo);
        if (error) {
            throw error;
        }
        res.json({ message: 'Vehículo eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});






// Ruta POST para crear una nueva reserva
app.post('/api/reservas', async (req, res) => {
    const { id_usuario, id_espacio, id_vehiculo, hora_inicio, hora_final, hora_sancion, descripcion_san, flag } = req.body;
    let codigo_reserva;

    try {
        let reservaExistente;
        do {
            // Generar un código de reserva único
            codigo_reserva = uuidv4(); // Usando UUID como ejemplo, asegúrate de instalar 'uuid' con npm install uuid
            
            // Consultar si ya existe una reserva con este código
            reservaExistente = await supabase
                .from('reservas')
                .select('id_reserva')
                .eq('codigo_reserva', codigo_reserva)
                .single();
        } while (reservaExistente.data !== null);

        // Insertar la nueva reserva en la tabla de reservas
        const { data: nuevaReserva, error } = await supabase
            .from('reservas')
            .insert({ codigo_reserva, id_usuario, id_espacio, id_vehiculo, hora_inicio, hora_final, hora_sancion, descripcion_san, flag })
            .single();
        if (error) {
            throw error;
        }

        res.status(201).json({ reserva: nuevaReserva });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});






// Ruta GET para obtener todas las reservas
app.get('/api/reservas', async (req, res) => {
    try {
        // Consultar todas las reservas en la tabla de reservas
        const { data: reservas, error } = await supabase
            .from('reservas')
            .select('*');
        if (error) {
            throw error;
        }

        res.status(200).json({ reservas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Ruta GET para obtener todas las reservas de un garaje específico
app.get('/api/garajes/:id/reservas', async (req, res) => {
    const idGaraje = req.params.id;
    try {
        // Obtener todos los espacios asociados al garaje
        const { data: espacios, error: espaciosError } = await supabase
            .from('espacios')
            .select('id_espacio')
            .eq('id_garaje', idGaraje);
        if (espaciosError) {
            throw espaciosError;
        }

        // Obtener todas las reservas asociadas a los espacios del garaje
        const { data: reservas, error: reservasError } = await supabase
            .from('reservas')
            .select('*')
            .in('id_espacio', espacios.map(espacio => espacio.id_espacio));
        if (reservasError) {
            throw reservasError;
        }

        res.status(200).json({ reservas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});











// Pagos
// Ruta POST para realizar un pago
app.post('/api/pagos', async (req, res) => {
    const { id_reserva } = req.body;
    try {
        // Obtener la información de la reserva
        const { data: reservaData, error: reservaError } = await supabase
            .from('reservas')
            .select('id_espacio, hora_inicio, hora_final')
            .eq('id_reserva', id_reserva)
            .single();
        if (reservaError) {
            throw reservaError;
        }

        // Obtener la información del garaje al que pertenece el espacio reservado
        const { id_espacio, hora_inicio, hora_final } = reservaData;
        const { data: garajeData, error: garajeError } = await supabase
            .from('espacios')
            .select('id_garaje')
            .eq('id_espacio', id_espacio)
            .single();
        if (garajeError) {
            throw garajeError;
        }

        // Calcular las horas totales de la reserva
        const horasTotales = Math.abs(new Date(hora_final) - new Date(hora_inicio)) / 36e5;

        // Obtener el costo por hora del garaje
        const { data: garajeInfo, error: garajeInfoError } = await supabase
            .from('garajes')
            .select('monto_hora')
            .eq('id_garaje', garajeData.id_garaje)
            .single();
        if (garajeInfoError) {
            throw garajeInfoError;
        }

        // Calcular el monto total del pago
        const monto_total = horasTotales * garajeInfo.monto_hora;

        // Insertar el nuevo pago en la tabla de pagos
        const { data: nuevoPago, error: pagoError } = await supabase
            .from('pagos')
            .insert({ id_reserva, monto_hora: garajeInfo.monto_hora, monto_total, monto_anticipado: 0, monto_sancion: 0 });
        if (pagoError) {
            throw pagoError;
        }

        res.status(201).json({ pago: nuevoPago });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});











//Login
// Ruta POST para iniciar sesión
app.post('/api/login/user', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Verificar si el usuario existe
        const { data: personas, error: personasError } = await supabase
            .from('personas')
            .select('*')
            .eq('usuario', usuario);
        if (personasError) {
            throw personasError;
        }

        // Si no hay ninguna persona con el nombre de usuario proporcionado, devolver un error
        if (!personas || personas.length === 0) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        // Obtener la primera persona encontrada
        const personaEncontrada = personas[0];

        // Verificar si la contraseña proporcionada coincide con la contraseña almacenada
        if (password !== personaEncontrada.password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Usuario autenticado correctamente
        res.status(200).json({ message: 'Inicio de sesión exitoso', persona: personaEncontrada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Login
// Ruta POST para iniciar sesión
app.post('/api/login/admin', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Verificar si el usuario existe
        const { data: personas, error: personasError } = await supabase
            .from('personas')
            .select('*')
            .eq('usuario', usuario);
        if (personasError) {
            throw personasError;
        }

        // Si no hay ninguna persona con el nombre de usuario proporcionado, devolver un error
        if (!personas || personas.length === 0) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        // Obtener la primera persona encontrada
        const personaEncontrada = personas[0];

        // Verificar si la contraseña proporcionada coincide con la contraseña almacenada
        if (password !== personaEncontrada.password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Verificar si el usuario es administrador
        if (personaEncontrada.rol !== 'administrador') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Usuario autenticado correctamente como administrador
        res.status(200).json({ message: 'Inicio de sesión exitoso', persona: personaEncontrada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Login
// Ruta POST para iniciar sesión
app.post('/api/login/arrendador', async (req, res) => {
    const { usuario, password } = req.body;

    try {
        // Verificar si el usuario existe
        const { data: personas, error: personasError } = await supabase
            .from('personas')
            .select('*')
            .eq('usuario', usuario);
        if (personasError) {
            throw personasError;
        }

        // Si no hay ninguna persona con el nombre de usuario proporcionado, devolver un error
        if (!personas || personas.length === 0) {
            return res.status(404).json({ message: 'El usuario no existe' });
        }

        // Obtener la primera persona encontrada
        const personaEncontrada = personas[0];

        // Verificar si la contraseña proporcionada coincide con la contraseña almacenada
        if (password !== personaEncontrada.password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Verificar si el usuario es administrador
        if (personaEncontrada.rol !== 'arrendador') {
            return res.status(403).json({ message: 'No autorizado' });
        }

        // Usuario autenticado correctamente como administrador
        res.status(200).json({ message: 'Inicio de sesión exitoso', persona: personaEncontrada });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});










const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
