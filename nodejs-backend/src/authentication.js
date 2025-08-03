const {
  AuthenticationService,
  JWTStrategy,
} = require("@feathersjs/authentication");
const { LocalStrategy } = require("@feathersjs/authentication-local");
const { expressOauth } = require("@feathersjs/authentication-oauth");
const { OAuthStrategy } = require('@feathersjs/authentication-oauth');

class GoogleStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    // this will set 'googleId'
    const baseData = await super.getEntityData(profile);

    // this will grab the picture and email address of the Google profile
    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email,
      provider: 'google',
      providerId: profile.sub,
      emailVerified: profile.email_verified,
      name: profile.name,
    };
  }
}

class FacebookStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);
    
    return {
      ...baseData,
      profilePicture: profile.picture?.data?.url,
      email: profile.email,
      provider: 'facebook',
      providerId: profile.id,
      name: profile.name,
    };
  }
}

class GithubStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    const baseData = await super.getEntityData(profile);
    
    return {
      ...baseData,
      profilePicture: profile.avatar_url,
      email: profile.email,
      provider: 'github',
      providerId: profile.id.toString(),
      name: profile.name || profile.login,
    };
  }
}

module.exports = (app) => {
  const authentication = new AuthenticationService(app);

  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new LocalStrategy());
  authentication.register('google', new GoogleStrategy());
  authentication.register('facebook', new FacebookStrategy());
  authentication.register('github', new GithubStrategy());

  app.use("/authentication", authentication);
  app.configure(expressOauth());
};
