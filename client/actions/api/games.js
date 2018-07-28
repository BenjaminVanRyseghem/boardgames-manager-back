import GetAll from "./games/getAll";
import GetAllPublishers from "./games/getPublishers";
import { requestApi } from "../../helpers/fetcher";

export const getAllGames = (filters) => requestApi(new GetAll({ filters }));
export const getAllPublishers = (filters) => requestApi(new GetAllPublishers({ filters }));
