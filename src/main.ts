import { config } from 'dotenv';
import { CONFIG_NAME } from "@shared/utils/enums";
import { getEnvOrThrow } from "@shared/utils/functions";
import { Logger } from "@nestjs/common";

config({path: __dirname + '/environments/.env.test'})

async function bootstrap() {
    const {createApp} = require('./shared/config/create-app')
    const app = await createApp()
    await app.listen(getEnvOrThrow(CONFIG_NAME.SERVER_PORT), getEnvOrThrow(CONFIG_NAME.SERVER_HOST));
    Logger.log("Application start at ::", getEnvOrThrow(CONFIG_NAME.SERVER_PORT), getEnvOrThrow(CONFIG_NAME.SERVER_HOST) )
}

bootstrap()