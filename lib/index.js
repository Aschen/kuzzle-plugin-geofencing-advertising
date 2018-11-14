/**
 * Plugins must be valid Node.js requirable modules,
 * usually shipped as a directory and containing either:
 *
 *  - an `index.js` file in its root directory, exporting a Javascript class
 *  - a well-formed `package.json` file in its root directory,
 *    specifying the path of the main requirable file in the `main` field.
 *
 * To determine the Plugin name, Kuzzle looks for the `name` field
 * in the `manifest.json` file.
 * @deprecated  - If no `manifest.json` file is found, Kuzzle will fall back
 * to the `package.json` file, if there is one. Otherwise, an exception is thrown
 * and Kuzzle will fail to start.
 *
 * @see https://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/
 */
class CorePlugin {
  /* eslint-disable no-unused-vars */
  /* eslint-disable no-console */

  /**
   * Create a new instance of CorePlugin
   *
   * Workflow:
   *  - Kuzzle loads plugins in <kuzzle install dir>/plugins/enabled/* and
   *     instantiate them, also configuration and manifest.json files are read.
   *  - The "init" function is called
   *  - The plugin manager registers all plugin features into Kuzzle:
   *    hooks, pipes, authentication strategies and custom API routes
   *
   * Kuzzle aborts its own start sequence if any error occurs during
   * plugins initialization.
   *
   */
  constructor () {
    /**
     * The plugin context is provided by Kuzzle as an argument to the
     * "init" function
     *
     * @type {PluginContext}
     */
    this.context = null;

    /**
     * Here is a good place to set default configuration values.
     * You can merge them with overridden values, provided by Kuzzle
     * as an argument to the "init" function.
     *
     * @type {Object}
     */
    this.config = {
      param: '<default value>'
    };

    /**
     * Specifies a set of events along with the asynchronous
     * listener functions they trigger.
     *
     * The function "asyncListener" will be called whenever
     * the following events are triggered:
     * - "document:beforeCreateOrReplace"
     * - "document:beforeReplace"
     * - "document:beforeUpdate"
     *
     * The function "asyncOverloadListener" will be called whenever the event
     * "core:overload" is triggered.
     *
     * @type {Object}
     *
     * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-hooks/
     * @see https://docs.kuzzle.io/kuzzle-events/
     */
    this.hooks = {
      'document:afterCreate':    'asyncListener',
      'core:overload':            'asyncOverloadListener'
    };

    /**
     * Specifies a set of events along with the synchronous
     * listener functions they trigger.
     *
     * The function "syncListener" will be called whenever the following
     * events are triggered:
     * - "document:beforeCreate"
     * - "realtime:beforePublish"
     *
     * Kuzzle will wait for these functions before continuing the request process
     *
     * @type {Object}
     *
     * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-pipes/
     * @see https://docs.kuzzle.io/kuzzle-events/
     */
    this.pipes = {
      'document:beforeDelete':  'syncListener',
      'realtime:beforePublish': 'syncListener'
    };

    /**
     * The "controllers" property enables to extend the Kuzzle API with
     * new controllers and actions
     *
     * These actions point to functions exposed to Kuzzle by the plugin.
     *
     * Any network protocol other than HTTP will be able to invoke this new
     * controller with the following JSON object:
     *
     * {
     *   controller: 'kuzzle-core-plugin-boilerplate/myNewController',
     *   action: 'myNewAction',
     *   ...
     * }
     *
     * @type {Object}
     *
     * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
     */
    this.controllers = {
      'myNewController': {
        'myNewAction': 'saySomething',
        'getDocument': 'getDocument'
      }
    };

    /**
     * The following "routes" exposed property allows Kuzzle to bind new
     * controllers and actions to HTTP endpoints
     *
     * Any parameter starting with a ':' in the URL will be made dynamic by Kuzzle.
     *
     * The first route exposes the following GET URL:
     *  https://<kuzzle server>:<port>/_plugin/kuzzle-core-plugin-boilerplate/say-something/<dynamic value>
     *
     * Kuzzle will call the function 'doSomething' with a Request object,
     * containing the "name" property: request.input.args.property = '<dynamic value>'
     *
     * The second route exposes the following POST URL:
     *  https://<kuzzle server>:<port>/_plugin/kuzzle-core-plugin-boilerplate/say-something
     *
     * Kuzzle will provide the content body of the request in the Request object
     * passed to the function 'doSomething', in the request.input.body property
     *
     * @type {Array}
     *
     * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
     */
    this.routes = [
      {verb: 'get', url: '/say-something/:property', controller: 'myNewController', action: 'myNewAction'},
      {verb: 'get', url: '/get-document/:documentId', controller: 'myNewController', action: 'getDocument'}
    ];

    /**
     * Here we register a new "dummy" authentication strategy which can be used to
     * authenticate kuzzle users.
     *
     * @type {Array}
     *
     * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
     * @see https://docs.kuzzle.io/guide/essentials/user-authentication/
     */
    this.authenticators = {
      // Authenticator class: there are more than 300 existing Passport
      // strategy, ready to be used with Kuzzle
      // You can also create your own Passport strategy
      // (see: https://github.com/jaredhanson/passport-strategy/)
      Dummy: require('passport-local').Strategy
    };

    this.strategies = {
      // "dummy" is the name of the authentication strategy
      dummy: {
        config: {
          // The authenticator name of the Passport strategy you chose
          authenticator: 'Dummy',

          // The list of fields that may be provided in the credentials
          fields: ['login', 'password']
        },
        // methods mapping are used to bind functions to your strategy
        // each function usage is described below
        methods: {
          afterRegister: 'afterRegister', // optional
          create: 'create',
          delete: 'delete',
          exists: 'exists',
          getById: 'getById', // optional
          getInfo: 'getInfo', // optional
          update: 'update',
          validate: 'validate',
          verify: 'verify'
        }
      }
    };
  }

  /**
   * Initializes the plugin with configuration and context.
   *
   * @param {Object} customConfig - This plugin custom configuration
   * @param {Object} context      - A restricted gateway to the Kuzzle API
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-creation-prerequisites/#plugin-init-function
   * @see https://docs.kuzzle.io/plugins-reference/managing-plugins#configuring-plugins
   * @see https://docs.kuzzle.io/plugins-reference/plugins-context/
   */
  init (customConfig, context) {
    this.config = Object.assign(this.config, customConfig);
    this.context = context;
  }

  /**
   * An example of an asynchronous listener function. It is triggered
   * by the `hooks` property defined above, and does not have return anything.
   * It is called asynchronously and Kuzzle does not wait for it to return.
   *
   * The event it is listening is sending a Request object to its listeners.
   * Check each event documentation to make sure your listener handle the right
   * payload type: https://docs.kuzzle.io/kuzzle-events/plugin-events/
   *
   * @param {Request} request The request that triggered the event
  */
  asyncListener (request) {
    // Your code here, for example...
    console.log(`hook action ${request.input.action} on document ${request.input.resource._id}`);
  }

  /**
   * Another example of an asynchronous listener function.
   *
   * Here, the listener payloed is a Number (see the core:overload event
   * documentation: https://docs.kuzzle.io/kuzzle-events/core#coreoverload)
   *
   * @param {Number} overload - The overload percentage
  */
  asyncOverloadListener (overload) {
    // Your code here, for example...
    console.log('Kuzzle is in overloaded state: ' + (overload * 100) + '%');
  }

  /**
   * An example of a synchronous listener function. It is triggered
   * by the `pipes` property defined above. It is called synchronously and its
   * return value will be used by Kuzzle as the new payload.
   * The returned value must be of the same type than the one provided.
   *
   * @param {Request} request   - The request that triggered the event
   * @param {Function} callback - The callback that bears the result of the
   *                            function. Signature: `callback(error, request)`
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-pipes/
   * @see https://docs.kuzzle.io/guide/essentials/request-and-response-format/
  */
  syncListener (request, callback) {
    // Your code here, for example...
    console.log(`pipe action ${request.input.action} on document ${request.input.resource._id}`);

    callback(null, request);
  }

  /**
   * An example of a controller function. It is called by the controller/action
   * routes defined in the `controllers` object above. It takes the request as
   * an argument and must return a Promise.
   *
   * @param {Request} request The request sent to the controller/action route
   * @return {Promise} A promise resolving the response of the route.
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-controllers/
   * @see https://docs.kuzzle.io/guide/essentials/request-and-response-format/
   */
  async saySomething (request) {
    let property;

    if (request.input.body && request.input.body.property) {
      // Here we are checking for property sent in request body (eg: REST POST data)
      property = request.input.body.property;
    }
    else if (request.input.args.property) {
      // Here we are checking for dynamic property sent in request (eg: REST GET arguments)
      property = request.input.args.property;
    }
    else {
      property = 'world';
    }

    console.log(`controller myNewController action myNewAction param ${property}`);
    return `Hello ${property}!`;
  }

  /**
   * An example of the integrated SDK JS 6 usage inside a plugin.
   * Since Kuzzle 1.5.0, the beta version of the SDK JS 6 is exposed inside the plugin context.
   * The SDK allows interacting with Kuzzle API in a much more pleasant way than using the context.accessors.execute method.
   *
   * This controller action simply gets a document from Kuzzle.
   * Since this action does not have an http route, you have to use a raw query with websocket protocol.
   * There is an example with the SDK JS 6:
   *
       const kuzzle = new Kuzzle('websocket', { host: 'localhost', port: 7512 });

       const query = {
         controller: 'kuzzle-core-plugin-boilerplate/myNewController',
         action: 'getDocument',
         documentId: 'my-id',
         indexName: 'my-index',
         collectionName: 'my-collection'
       };

       try {
         await kuzzle.connect();
         const response = await kuzzle.query(query, {});
         console.log(response._result);
       } catch (error) {
         console.log(error);
       }
   *
   *
   * @see the SDK JS 6 README for more informations https://github.com/kuzzleio/sdk-javascript/tree/6-beta
   */
  async getDocument (request) {
    const
      index = request.input.args.indexName,
      collection = request.input.args.collectionName,
      documentId = request.input.args.documentId;

    const response = await this.context.accessors.sdk.document.get(index, collection, documentId);
    console.log(`Document ${response._id} found`);

    // Return the document
    return response._source;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * (optional)
   * Called after the strategy has been built with the constructor
   *
   * @param {PassportStrategy} instantiatedStrategy
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  afterRegister (instantiatedStrategy) {
    // do some action
  }

  /**
   * Part of the new authentication strategy definition
   *
   * Persists the provided credentials.
   * The plugin has full responsibility over how credentials are stored, but
   * Kuzzle provides an easy-to-access and secured storage dedicated to plugins
   * (see https://docs.kuzzle.io/plugins-reference/plugins-context/accessors#storage)
   *
   * The plugin must be able to access credentials using only a provided kuid.
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @param {string} strategyName
   *
   * @returns {Promise<object>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async create (request, credentials, kuid, strategyName) {
    // persist credentials
    return /* non sensitive credentials info */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * Removes the provided kuid from this plugin's storage
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @param {string} strategyName
   *
   * @returns {Promise<object>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async delete (request, kuid, strategyName) {
    // remove credentials
    return /* any value */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * Checks if user's credentials exist within this plugin
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @param {string} strategyName
   *
   * @returns {Promise<boolean>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async exists (request, kuid, strategyName) {
    // check credentials existence
    return /* true|false */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * (optional)
   * Retrieves non sensitive user's credentials information
   * from the persistence layer.
   *
   * DO NOT return sensitive information, as this method is called by Kuzzle API,
   * and the returned value will be sent across the network to a
   * requesting user.
   *
   * If this function is not provided, Kuzzle will return an empty object instead.
   *
   * @param {KuzzleRequest} request
   * @param {string} kuid
   * @param {string} strategyName [description]
   *
   * @returns {Promise<object>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async getInfo (request, kuid, strategyName) {
    // retrieve credentials
    return /* non sensitive credentials info */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * (optional)
   * Retrieves the non sensitive user's credentials information
   * from the persistence layer using this strategy internal id
   *
   * DO NOT return sensitive information, as this method is called by Kuzzle API,
   * and the returned value will be sent as is across the network to a
   * requesting user.
   *
   * If this function is not provided, Kuzzle will return an empty object instead.
   *
   * @param {KuzzleRequest} request
   * @param {string} id
   * @param {string} strategyName
   *
   * @returns {Promise<object>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async getById (request, id, strategyName) {
    // retrieve credentials
    return /* non sensitive credentials info */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * Updates the user's credentials information in the
   * persistence layer
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @param {string} strategyName
   *
   * @returns {Promise<object>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async update (request, credentials, kuid, strategyName) {
    // update credentials
    return /* non sensitive credentials info */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * Validates credentials validity conforming to the
   * authentication strategy rules (mandatory fields,
   * password length, username uniqueness, ...)
   *
   * @param {KuzzleRequest} request
   * @param {object} credentials
   * @param {string} kuid
   * @param {string} strategyName
   * @param {boolean} isUpdate
   *
   * @returns {Promise<boolean>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async validate (request, credentials, kuid, strategyName, isUpdate) {
    // validate credentials
    return /* true|false */;
  }

  /**
   * Part of the new authentication strategy definition
   *
   * Provided to the Passport strategy as a verify function.
   * This method signature varies, depending on the Passport strategy.
   * The only constant is the first argument, which is always the
   * request object, materializing the call to the login API route.
   *
   * The function must return a Promise that resolves to an object
   * that can contain two attributes:
   * - kuid: the kuid corresponding to the provided credentials. If
   *   undefined, null or invalid, Kuzzle will reject the login request
   * - message: if the login request is rejected (i.e. if kuid is null), plugins
   *   can set an optional message that will be passed to the requesting user as
   *   a rejection reason
   *
   * If the user is authenticated, the kuid attribute must contain
   * the kuid of the user,
   * else the kuid should be null and the message attribute must contain
   * a string giving the reason explaining why the user can not be authenticated.
   *
   * The function should reject the Promise if an error occurs
   * (note: an authentication rejection is not an error).
   *
   * @param {Request} request
   * @param {*[]} args - provided arguments depends on the Passport strategy
   *
   * @returns {Promise<{kuid: string|null, message: string|undefined}>}
   *
   * @see https://docs.kuzzle.io/plugins-reference/plugins-features/adding-authentication-strategy/
   */
  async verify (request, username, password) {
    if (username === 'hackerman' && password === 'itshackingtime') {
      return {
        kuid: username
      };
    }

    return {
      kuid: null,
      message: 'Login failed - Reason: You shall not pass!'
    };
  }
}

module.exports = CorePlugin;
