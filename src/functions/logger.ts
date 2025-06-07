import { settings } from "../settings";
import ck from "chalk";

async function error(msg: any) {
  switch (settings.terminal) {
    case "informativo":
      const date = new Date();
      console.log(
        ck.redBright(
          `[ERROR] [${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}] ${msg}`
        )
      );
      break;

    case "minimalista":
      console.log(ck.redBright(`✗ ${msg}`));
      break;
    default:
      break;
  }
}

async function success(msg: any) {
  switch (settings.terminal) {
    case "informativo":
      const date = new Date();
      console.log(
        ck.greenBright(
          `[SUCCESS] [${date.getDay()}/${date.getMonth()}/${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}] ${msg}`
        )
      );
      break;

    case "minimalista":
      console.log(ck.greenBright(`${msg}`));
      break;
    default:
      break;
  }
};


export const logger = {
    success,
    error
};