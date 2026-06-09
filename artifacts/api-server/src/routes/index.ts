import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clientsRouter from "./clients";
import pricesRouter from "./prices";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clientsRouter);
router.use(pricesRouter);
router.use(historyRouter);

export default router;
