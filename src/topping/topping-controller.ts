import { NextFunction, Response, Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { UploadedFile } from "express-fileupload";
import { ToppingService } from "./topping-service";
import { CreateRequestBody, Topping } from "./topping-types";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private storage: FileStorage,
    ) {}

    create = async (
        req: Request<object, object, CreateRequestBody>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const image = req.files!.image as UploadedFile;
            const fileUuid = uuidv4();

            await this.storage.upload({
                filename: fileUuid,
                fileData: image.data,
            });

            const savedTopping = await this.toppingService.create({
                ...req.body,
                image: fileUuid,
                tenantId: req.body.tenantId,
            } as Topping);

            res.json({ id: savedTopping._id });
        } catch (err) {
            return next(err);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const toppings = await this.toppingService.getAll(
                req.query.tenantId as string,
            );

            const readyToppings = toppings.map((topping) => {
                return {
                    name: topping.name,
                    price: topping.price,
                    tenantId: topping.tenantId,
                    image: this.storage.getObjectUri(topping.image),
                };
            });
            res.json(readyToppings);
        } catch (err) {
            return next(err);
        }
    };
}
