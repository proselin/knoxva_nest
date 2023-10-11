import {config} from 'dotenv';
config({path: __dirname + '/environments/.env.test'})

import {CONFIG_NAME} from "@shared/utils/enums";
import {getEnvOrThrow} from "@shared/utils/functions";
import {createApp} from "@shared/config/create-app";



async function bootstrap() {
    const app = await createApp()
    await app.listen(getEnvOrThrow(CONFIG_NAME.SERVER_PORT));
}
bootstrap()