import crypto from "crypto"
import express from "express"
import { Application, Request, Response } from "express";

export interface EventRouteOptions<T extends Record<string, any>> {
    route?: string;
    publicKey: string;
    handlers: {
        [K in keyof T]: (data: T[K]) => void;
    };
}

export const eventSetup = <T extends Record<string, any>>
    (app: Application, options: EventRouteOptions<T>) => {
    const route = options.route || "/events"

    const router = express.Router();

    router.put(route, express.json(), (req: Request, res: Response) => {
        try {

            const { signature, message } = req.body

            if (!message || !signature) {
                return res.status(400).json({ error: "Missing message or signature" });
            }

            const pemKey = `-----BEGIN PUBLIC KEY-----\n${options.publicKey}\n-----END PUBLIC KEY-----`;

            const publicKey = crypto.createPublicKey({
                key: pemKey,
                format: "pem",
                type: "spki"
            });

            const isValid = crypto.verify(
                null,
                Buffer.from(message),
                publicKey,
                Buffer.from(signature, "base64")
            );

            if (!isValid) {
                console.log(isValid)
                return res.status(400).json({ error: "invalid signature" });
            }

            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: e.message })
        }
    })

    router.post(route, express.json(), (req, res) => {
        try {
            const { name, payload, signature } = req.body;

            if (!name || !payload || !signature) {
                return res.status(400).json({ error: "Missing name, payload or signature" });
            }

            const pemKey = `-----BEGIN PUBLIC KEY-----\n${options.publicKey}\n-----END PUBLIC KEY-----`;

            const publicKey = crypto.createPublicKey({
                key: pemKey,
                format: "pem",
                type: "spki"
            });

            const isValid = crypto.verify(
                null,
                Buffer.from(payload),
                { key: publicKey },
                Buffer.from(signature, "base64")
            );

            if (!isValid) {
                return res.status(403).json({ error: "invalid signature" });
            }

            const handler = options.handlers[name as keyof T];

            if (!handler) {
                return res.status(400).json({ error: `No handler found for event name: ${name}` });
            }

            try {
                handler(JSON.parse(payload));

                res.status(200).json({ success: true });
            } catch (err) {
                console.error(err);

                res.status(500).json({ error: "Handler error" });
            }
        } catch (e) {
            return res.status(500).json({ error: e.message })
        }
    })

    return app.use(router)
}
