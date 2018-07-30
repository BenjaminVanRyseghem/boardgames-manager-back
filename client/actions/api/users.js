import HasUsers from "./users/hasUsers";
import { requestApi } from "../../helpers/fetcher";

export const getHasUsers = () => requestApi(new HasUsers());
