import jwt from 'jsonwebtoken';
import _ from 'lodash';
import { crypto } from '@footy/fmk/utils/crypto';

class JwtUtil {
    issueToken(payload: Record<string, unknown>, options: jwt.SignOptions = { algorithm: 'RS256' }) {
        const privateKey = crypto.privateKey;
        return jwt.sign(payload, privateKey, options);
    }

    verifyToken(token: string, options: jwt.VerifyOptions = { algorithms: ['RS256'] }) {
        const publicKey = crypto.publicKey;
        return jwt.verify(token, publicKey, options) as Record<string, string>;
    }

    decodeToken(token: string, options: jwt.DecodeOptions = { complete: false }) {
        return jwt.decode(token, options);
    }

    decodeJwt(authorization: string, verify = false, options: jwt.VerifyOptions = { algorithms: ['RS256'] }) {
        const authStr = _.trim(authorization);
        let token: any;
        let tokenStr = authStr;
        if (authStr.startsWith('Bearer ')) {
            // Remove Bearer from string
            tokenStr = authStr.slice(7, authStr.length);
        }
        if (!_.isNil(tokenStr)) {
            if (verify) {
                token = this.verifyToken(tokenStr, options);
            } else {
                token = this.decodeToken(tokenStr);
            }
        }
        return token;
    }
}

export const jwtUtil = new JwtUtil();