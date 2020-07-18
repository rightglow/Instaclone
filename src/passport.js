import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { prisma } from "../generated/prisma-client";

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

// payload는 토큰에서 해석된 id를 받아서, user를 찾아서 리턴
const verifyUser = async (payload, done) => {
  try {
    const user = await prisma.user({ id: payload.id });
    if (user !== null) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error, false);
  }
};

// 토큰 추출 + verifyUser 이후에 콜백함수가 실행되어, 사용자가 있으면 그 사용자를 request에 추가
export const authenticateJwt = (request, response, next) => {
  passport.authenticate("jwt", { sessions: false }, (error, user) => {
    if (user) {
      request.user = user;
    }
    next();
  })(request, response, next);
};

// 토큰이 추출되면 verifyUser을 payload와 함께 실행
passport.use(new Strategy(jwtOptions, verifyUser));
passport.initialize();
