/*
 * Copyright 2011-2018 GatlingCorp (https://gatling.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package computerdatabase

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

class Websocket extends Simulation {
  val host = System.getProperty("host", "localhost")
  val lat = System.getProperty("lat", "10.0").toFloat
  val lng = System.getProperty("lng", "10.0").toFloat
  val requests = System.getProperty("requests", "1").toInt
  val users = System.getProperty("users", "1").toInt

  val httpProtocol = http
    .baseUrl("http://" + host + ":7512")
    .acceptHeader("text/html,application/json,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
    .acceptEncodingHeader("gzip, deflate")
    .userAgentHeader("Gatling2")
    .wsBaseUrl("ws://" + host + ":7512")


  val scn = scenario("WebSocket")
    .exec(ws("Connect WS").connect("/"))
    .pause(1)
    .exec(ws("Say Hello WS")
      .sendText("""{"controller": "auth", "action": "login", "strategy": "local", "body": { "username": "aschen", "password": "aschen" } }""")
      .await(30 seconds)(
        ws.checkTextMessage("checkName").check(regex(".*jwt.*"))
      )
    )
    .repeat(requests, "i") {
      exec(ws("Geofence test")
        .sendText("""{"controller": "geofencing-advertising/geofence", "action": "test", "lat":""" + lat + """, "lng": """ + lng + """ }""")
        .await(1 seconds)(
          ws.checkTextMessage("checkPolygon").check(regex(".*polygon.*"))
        )
      )
    }
    .exec(ws("Close WS").close)

  setUp(scn.inject(
    atOnceUsers(users)
  ).protocols(httpProtocol))
}
