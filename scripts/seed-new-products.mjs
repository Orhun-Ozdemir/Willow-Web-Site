import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newProducts = [
    {
      "id": 1,
      "name": "WillowBee",
      "type": "LoRaWAN Wireless Module",
      "category": "Module",
      "description": "Industrial-grade LoRaWAN-enabled MCU module for low-power sensor end-nodes and embedded applications. Based on STM32WL Cortex-M4, integrates MCU and LoRa radio on a single chip.",
      "specifications": {
        "protocol": "LoRaWAN 1.1.0",
        "mcu": "STM32WL Cortex-M4",
        "rf_output_power": "up to 22 dBm",
        "region_support": "US, EU, AS, AU, KR, IN, RU* (*not certified in all regions)",
        "gpio_pins": 15,
        "flash_memory": "32 Mbit external serial Flash",
        "power_support": "battery or DC input",
        "operating_temperature": "-40°C to +85°C",
        "dimensions": "34.54mm × 24.38mm × 9.14mm",
        "warranty": "3 years",
        "features": [
          "Pin-compatible with popular wireless modules",
          "U.FL RF connector",
          "On-board 2 LEDs and 1 user button",
          "Peripheral drivers: ADC, DAC, GPIO, SPI, UART, I2C"
        ]
      },
      "applications": null,
      "battery_life": null,
      "communication_range": null
    },
    {
      "id": 2,
      "name": "WillowSonic",
      "type": "LoRaWAN Ultrasonic Distance/Level Sensor",
      "category": "Outdoor Sensor",
      "description": "Measures distance and level by detecting ultrasonic pulses reflected from liquid and solid surfaces. Designed for manholes, canals, tanks, snow/water level monitoring.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "sleep_current": "1.5 μA",
        "enclosure": "IP67 outdoor-rated",
        "sensor_holder": "Galvanized",
        "measurement_range": "up to 7.5 meters",
        "reported_parameters": [
          "Target distance (liquid, snow, etc.)",
          "Sensor temperature",
          "Battery level"
        ]
      },
      "applications": [
        "Manhole flooding monitoring",
        "Water tank level monitoring",
        "Snow level measurement",
        "Wastewater level monitoring",
        "Cereal and grain storage level monitoring",
        "Industrial liquid level monitoring",
        "Flood prevention systems",
        "Stormwater drainage monitoring"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 3,
      "name": "WillowAir",
      "type": "LoRaWAN Indoor Air Quality Sensor",
      "category": "Indoor Sensor",
      "description": "Measures TVOC, eCO2, and temperature for IoT-based building and environmental monitoring.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "sleep_current": "1.5 μA",
        "enclosure": "Wall-mountable",
        "features": [
          "Configurable instant status notifications",
          "LoRaWAN downlink support"
        ],
        "reported_parameters": [
          "TVOC (Total Volatile Organic Compounds)",
          "eCO2 (equivalent CO2)",
          "Sensor temperature",
          "Battery level"
        ]
      },
      "applications": [
        "Homes and residential buildings",
        "Offices and commercial buildings",
        "Factories and industrial facilities",
        "Warehouses and logistics centers",
        "Greenhouses and controlled environments",
        "Schools and universities",
        "Hospitals and healthcare facilities",
        "Hotels and hospitality buildings"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 4,
      "name": "WillowGPS",
      "type": "IP67 LoRaWAN GPS Module",
      "category": "Outdoor Sensor",
      "description": "Measures latitude, longitude, elevation, speed. Integrated LoRa and GPS antennas for compact deployment.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "sleep_current": "1.5 μA",
        "enclosure": "Wall-mountable",
        "features": [
          "Configurable instant status notifications",
          "LoRaWAN downlink support"
        ],
        "reported_parameters": [
          "Latitude and longitude",
          "Elevation",
          "Speed",
          "Battery level",
          "Device temperature"
        ]
      },
      "applications": [
        "Vehicle tracking",
        "Asset and object tracking",
        "Route logging and trip analysis",
        "Fleet monitoring and management",
        "Logistics and supply chain tracking"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 5,
      "name": "WillowPanic",
      "type": "IP67 Industrial LoRaWAN Panic Button",
      "category": "Safety Device",
      "description": "Sends emergency alert to central monitoring unit when activated. Ideal for health interventions or security.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "enclosure": "IP67 wall-mountable",
        "features": [
          "Configurable instant status notifications",
          "Reflective yellow label"
        ]
      },
      "applications": [
        "Offices",
        "Homes",
        "Warehouses",
        "Airports",
        "Industrial Facilities",
        "Other Buildings & Sites"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 6,
      "name": "WillowSens",
      "type": "LoRaWAN Door Open/Close Sensor",
      "category": "Magnetic Contact Sensor",
      "description": "Monitors door status (open/close events). Ideal for remote monitoring of doors, cabinets, drawers, windows.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "features": [
          "Low power design",
          "Configurable instant status notifications",
          "Programmable periodic status report",
          "Indoor and outdoor options"
        ]
      },
      "applications": [
        "Laboratory Doors",
        "Warehouse Doors",
        "Server Room Doors",
        "Electrical Panel Room Doors",
        "Executive Room Doors",
        "Security Room Doors",
        "Cabinets and Drawers",
        "Remote monitoring window openings/closings"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 7,
      "name": "WillowTilt",
      "type": "Outdoor IP67 LoRaWAN Tilt Sensor",
      "category": "Motion Sensor",
      "description": "Measures 3-axis motion and transmits X, Y, Z acceleration data. Detects movement, motion, vibration.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 5 years",
        "enclosure": "IP67 wall-mountable",
        "features": [
          "Low power design",
          "Configurable instant status notifications"
        ],
        "reported_parameters": [
          "Acceleration on X, Y, Z axes",
          "Sensor temperature",
          "Battery level"
        ]
      },
      "applications": [
        "Automobile Security Systems",
        "Buildings and Infrastructure",
        "Railway and Highway Tunnels",
        "Mining and Geotechnical Monitoring",
        "Handheld Devices",
        "Gaming and Pointing Devices",
        "Industrial Machinery"
      ],
      "battery_life": "up to 5 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 8,
      "name": "WillowTemp",
      "type": "LoRaWAN Temperature and Humidity Sensor",
      "category": "Environmental Sensor",
      "description": "Accurately measures temperature and humidity in outdoor environments with real-time remote monitoring.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "enclosure": "IP67 wall-mountable",
        "features": [
          "Low power design",
          "Configurable instant status notifications",
          "LoRaWAN downlink support"
        ]
      },
      "applications": [
        "Homes",
        "Factories",
        "Warehouses",
        "Offices",
        "Indoor and Outdoor Sites",
        "Greenhouses"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 9,
      "name": "WillowMod",
      "type": "IP67 Industrial LoRaWAN Modbus Sensor",
      "category": "Industrial IoT Bridge",
      "description": "Reads/writes to user-defined Modbus registers and creates a wireless Modbus RTU pass-through bridge over LoRaWAN.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "enclosure": "IP67 wall-mountable",
        "features": [
          "Low power design",
          "Configurable instant status notifications",
          "LoRaWAN downlink support",
          "Reads up to 20 Modbus registers",
          "Configurable baud rates 300 to 115,200",
          "Supports Modbus RTU protocol"
        ]
      },
      "applications": [
        "Industrial Facilities",
        "Factories",
        "Warehouses",
        "Greenhouses",
        "Energy Monitoring Systems",
        "PLC Applications",
        "Gas and Water Metering"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 10,
      "name": "WillowMos",
      "type": "Outdoor LoRaWAN Soil Moisture Sensor",
      "category": "Agricultural Sensor",
      "description": "Measures soil temperature and soil moisture. Also measures indoor air quality. Data transmitted over LoRaWAN.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "enclosure": "Wall-mountable",
        "features": [
          "Low power design",
          "Configurable instant status notifications",
          "LoRaWAN downlink support",
          "Soil moisture sensing range up to 30 m radius"
        ],
        "reported_parameters": [
          "Soil moisture",
          "Soil temperature",
          "Battery level",
          "Sensor internal temperature"
        ]
      },
      "applications": [
        "Smart Farming Applications",
        "Gardens",
        "Greenhouses",
        "Food Industry Facilities",
        "Farms"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 11,
      "name": "WillowPre",
      "type": "IP67 LoRaWAN Liquid Pressure Sensor",
      "category": "Industrial Sensor",
      "description": "Measures liquid pressure in pipes and tank systems. Suitable for harsh operating conditions.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "pressure_range": "0–1500 PSI",
        "enclosure": "IP67-rated",
        "sensor_holder": "Galvanized",
        "features": [
          "Low power design",
          "Configurable instant status notifications"
        ],
        "reported_parameters": [
          "Pipeline pressure level",
          "Tank pressure level"
        ]
      },
      "applications": [
        "Pipeline Pressure Monitoring",
        "Water Tank Pressure",
        "Wastewater Level Monitoring",
        "Industrial Liquid Pressure Systems",
        "Chemical Processing Plants",
        "Hydraulic Systems",
        "Irrigation Systems"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 12,
      "name": "WillowAne",
      "type": "Outdoor LoRaWAN Anemometer",
      "category": "Weather Sensor",
      "description": "Measures wind speed in outdoor environments. Designed for harsh conditions.",
      "specifications": {
        "protocol": "LoRaWAN 868/915 MHz",
        "communication_range": "up to 15 km",
        "battery_life": "up to 10 years",
        "enclosure": "Wall-mountable",
        "features": [
          "Low power design",
          "Configurable instant status notifications",
          "LoRaWAN downlink support"
        ],
        "sensor_specs": {
          "test_range": "0.5 m/s to 50 m/s",
          "minimum_measurable": "0.2 m/s",
          "resolution": "0.1 m/s",
          "maximum_wind_speed": "70 m/s"
        }
      },
      "applications": [
        "Weather Stations",
        "Airports",
        "Ports and Harbors",
        "Skyscrapers",
        "Industrial Sites",
        "Farms"
      ],
      "battery_life": "up to 10 years",
      "communication_range": "up to 15 km"
    },
    {
      "id": 13,
      "name": "Outdoor Temperature and Humidity Sensor",
      "type": "LoRaWAN Environmental Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Accurately measures temperature and humidity. Up to 10 years battery life (5 min interval). Supports over-the-air configuration.",
      "specifications": {
        "battery_life": "up to 10 years (5 min measurement interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 14,
      "name": "Battery Level Sensor",
      "type": "LoRaWAN Voltage Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Measures voltage on three independent inputs (0-50V). Up to 10 years battery life (5 min interval). Over-the-air configuration.",
      "specifications": {
        "measurement_range": "0-50 V per input",
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 15,
      "name": "Outdoor Air Quality Sensor",
      "type": "LoRaWAN IAQ Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Measures temperature, humidity, CO2, and TVOC index. Ultra-low-power, up to 10 years battery life (5 min interval). Over-the-air configuration.",
      "specifications": {
        "measured_parameters": ["temperature", "humidity", "CO2", "TVOC index"],
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 16,
      "name": "I/O Module",
      "type": "LoRaWAN Encoder Reader",
      "category": "Outdoor Sensor (short spec)",
      "description": "Reads and transmits encoder values over LoRaWAN for position, rotation, or movement data. Over-the-air configuration.",
      "specifications": {
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": null,
      "communication_range": null
    },
    {
      "id": 17,
      "name": "Encoder Module",
      "type": "LoRaWAN Motion/Position Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Reads and transmits encoder values for reliable remote monitoring of motion and position data. Over-the-air configuration.",
      "specifications": {
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": null,
      "communication_range": null
    },
    {
      "id": 18,
      "name": "Modbus Bridge",
      "type": "LoRaWAN Modbus Gateway",
      "category": "Outdoor Sensor (short spec)",
      "description": "Reads up to 120 different Modbus tags and transmits data over LoRaWAN. Up to 10 years battery life (5 min interval). Over-the-air configuration.",
      "specifications": {
        "max_modbus_tags": 120,
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 19,
      "name": "Electricity Meter Module",
      "type": "LoRaWAN Energy Meter Interface",
      "category": "Outdoor Sensor (short spec)",
      "description": "Collects data from electricity meters using IEC 62056 protocol. Can interface with up to 16 meters. Over-the-air configuration.",
      "specifications": {
        "protocol": "IEC 62056",
        "max_meters": 16,
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": null,
      "communication_range": null
    },
    {
      "id": 20,
      "name": "Current Meter",
      "type": "LoRaWAN Contactless Current Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Contactless measurement of current consumption of industrial equipment. Up to 10 years battery life (5 min interval). Easy deployment without interrupting wiring.",
      "specifications": {
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Contactless", "Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 21,
      "name": "Methane Level Sensor",
      "type": "LoRaWAN Gas Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Measures CH4 (methane) and CO2 levels in air. Up to 10 years battery life (5 min interval). Over-the-air configuration.",
      "specifications": {
        "measured_gases": ["CH4", "CO2"],
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 22,
      "name": "Pulse Module",
      "type": "LoRaWAN Pulse Counter",
      "category": "Outdoor Sensor (short spec)",
      "description": "Captures pulse signals from machines and utility meters (water, gas). Up to 10 years battery life (5 min interval). Over-the-air configuration.",
      "specifications": {
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 23,
      "name": "Tilt Sensor (Outdoor)",
      "type": "LoRaWAN Displacement Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Measures axis orientation and displacement of devices/machines. Up to 10 years battery life (5 min interval). Over-the-air configuration.",
      "specifications": {
        "battery_life": "up to 10 years (5 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 10 years",
      "communication_range": null
    },
    {
      "id": 24,
      "name": "Barometric Pressure Sensor",
      "type": "LoRaWAN Barometer",
      "category": "Outdoor Sensor (short spec)",
      "description": "Measures barometric pressure. Over-the-air configuration.",
      "specifications": {
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": null,
      "communication_range": null
    },
    {
      "id": 25,
      "name": "Soil Temperature Moisture Sensor",
      "type": "LoRaWAN Agricultural Sensor",
      "category": "Outdoor Sensor (short spec)",
      "description": "Measures soil temperature and moisture. Battery life: up to 3 years (5 min interval) or up to 10 years (30 min interval). Over-the-air configuration.",
      "specifications": {
        "battery_life": "up to 3 years (5 min interval) / up to 10 years (30 min interval)",
        "features": ["Over-the-air configuration"]
      },
      "applications": null,
      "battery_life": "up to 3-10 years",
      "communication_range": null
    }
];

function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

async function run() {
  for (let i = 0; i < newProducts.length; i++) {
    const p = newProducts[i];
    const slug = generateSlug(p.name);
    
    // We try to find if a product with this slug already exists to preserve image or override it
    let { data: existing } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', 'products')
      .eq('slug', slug)
      .single();

    let featuresList = [];
    let specsList = [];
    
    if (p.specifications) {
      for (const [key, val] of Object.entries(p.specifications)) {
        if (key === 'features' && Array.isArray(val)) {
          featuresList = val;
        } else if (Array.isArray(val)) {
          specsList.push(`${key}: ${val.join(', ')}`);
        } else if (val) {
          specsList.push(`${key}: ${val}`);
        }
      }
    }

    const newData = {
      name: p.name,
      title: p.name,
      subtitle: p.type,
      category: p.category,
      description: p.description,
      features: featuresList,
      specs: specsList,
      applications: p.applications || []
    };
    
    let finalData = newData;
    if (existing && existing.data) {
      finalData = {
        ...existing.data,
        ...newData,
      };
      
      if (featuresList.length === 0 && existing.data.features) finalData.features = existing.data.features;
      if (specsList.length === 0 && existing.data.specs) finalData.specs = existing.data.specs;
      if (!p.applications && existing.data.applications) finalData.applications = existing.data.applications;
    }

    const payload = {
      type: 'products',
      slug: slug,
      sort_order: i + 1,
      data: finalData
    };

    if (existing) {
      console.log(`Updating existing product: ${slug}`);
      await supabase
        .from('site_content')
        .update(payload)
        .eq('id', existing.id);
    } else {
      console.log(`Inserting new product: ${slug}`);
      await supabase
        .from('site_content')
        .insert(payload);
    }
  }
  console.log("Products seeded successfully.");
}

run().catch(console.error);
