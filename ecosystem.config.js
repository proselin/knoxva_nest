module.exports = {
    apps: [{
        name: "knoxva_nest",
        script: "dist/main.js",
        env_production: {
            NODE_ENV: "production"
        },
        env_development: {
            NODE_ENV: "development"
        },
        max_memory_restart: "1000M",
        "node-args": "--expose-gc",
        watch_delay: 2000,
        ignore_watch : ["node_modules", "\\.git", "*.log"],
        watch: ["build"],
        instances: 3
    }]
}
  