import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteDataPath = path.join(__dirname, "..", "data", "site-data.json");

const siteData = JSON.parse(fs.readFileSync(siteDataPath, "utf8"));

const mappings = {
  willowsonic: {
    apps: {
      "Cereal and grain storage level monitoring": "barn"
    }
  },
  willowair: {
    apps: {
      "Factories and industrial facilities": "factory",
      "Warehouses and logistics centers": "barn",
      "Schools and universities": "building",
      "Hospitals and healthcare facilities": "activity"
    },
    params: {
      "TVOC (Total Volatile Organic Compounds)": "leaf"
    }
  },
  willowgps: {
    apps: {
      "Asset and object tracking": "location",
      "Route logging and trip analysis": "map",
      "Logistics and supply chain tracking": "map"
    },
    params: {
      "Latitude and longitude": "location",
      "Elevation": "mountain",
      "Speed": "activity"
    }
  },
  willowpanic: {
    apps: {
      "Offices": "building",
      "Homes": "building",
      "Warehouses": "barn",
      "Airports": "building",
      "Industrial Facilities": "factory"
    }
  },
  willowsens: {
    apps: {
      "Laboratory Doors": "building",
      "Warehouse Doors": "barn",
      "Server Room Doors": "stack",
      "Electrical Panel Room Doors": "gear",
      "Executive Room Doors": "building",
      "Cabinets and Drawers": "mount",
      "Remote monitoring window openings/closings": "shield"
    }
  },
  willowtemp: {
    apps: {
      "Homes": "building",
      "Factories": "factory",
      "Warehouses": "barn",
      "Offices": "building",
      "Indoor and Outdoor Sites": "map"
    }
  },
  willowmod: {
    apps: {
      "Industrial Facilities": "factory",
      "Factories": "factory",
      "Warehouses": "barn",
      "Energy Monitoring Systems": "activity",
      "PLC Applications": "gear"
    }
  },
  willowmos: {
    apps: {
      "Gardens": "leaf",
      "Food Industry Facilities": "factory"
    },
    params: {
      "Soil moisture": "droplet"
    }
  },
  willowpre: {
    apps: {
      "Pipeline Pressure Monitoring": "activity",
      "Chemical Processing Plants": "factory",
      "Hydraulic Systems": "gear",
      "Irrigation Systems": "sprout"
    },
    params: {
      "Pipeline pressure level": "activity",
      "Tank pressure level": "activity"
    }
  },
  willowane: {
    apps: {
      "Weather Stations": "cloud",
      "Airports": "building",
      "Ports and Harbors": "water",
      "Skyscrapers": "building",
      "Industrial Sites": "factory"
    }
  }
};

if (Array.isArray(siteData.products)) {
  siteData.products = siteData.products.map(product => {
    const id = product.id;
    const rules = mappings[id];
    if (!rules) return product;

    // Fix applications
    if (rules.apps && Array.isArray(product.applications)) {
      product.applications = product.applications.map(app => {
        const replacement = rules.apps[app.label];
        if (replacement) {
          console.log(`Fixing app icon for ${id}: "${app.label}" -> ${replacement}`);
          app.icon = replacement;
        }
        return app;
      });
    }

    // Fix reported parameters in specifications
    if (rules.params && product.specifications && Array.isArray(product.specifications.reported_parameters)) {
      product.specifications.reported_parameters = product.specifications.reported_parameters.map(param => {
        const replacement = rules.params[param.label];
        if (replacement) {
          console.log(`Fixing param icon for ${id}: "${param.label}" -> ${replacement}`);
          param.icon = replacement;
        }
        return param;
      });
    }

    return product;
  });

  fs.writeFileSync(siteDataPath, JSON.stringify(siteData, null, 2) + "\n", "utf8");
  console.log("Successfully fixed product icons in site-data.json");
} else {
  console.error("No products array found in site-data.json");
}
