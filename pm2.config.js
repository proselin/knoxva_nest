module.exports = {
    apps : [{
      name   : "knoxva_nest",
      script : "dist/main.js",
      env_production: {
         NODE_ENV: "production"
      },
      env_development: {
         NODE_ENV: "development"
      },
      max_memory_restart: "300M",
        "node-args": "--expose-gc",
      instances: 2
    }]
  }
  