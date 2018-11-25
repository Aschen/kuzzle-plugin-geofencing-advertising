require "benchmark"
require "http/web_socket"
require "json"

message = JSON.build do |json|
  json.object do
    json.field "controller", "geofencing-advertising/geofence"
    json.field "action", "test"
    json.field "lat", ARGV[0]
    json.field "lng", ARGV[1]
  end
end

client = HTTP::WebSocket.new(URI.parse("ws://localhost:7512"))

channel = Channel(String).new

spawn do
  count = 100

    while count > 0
      time = Benchmark.realtime do
        client.send(message)
        count -= 1
        channel.receive
      end
    puts time
  end
end


client.on_message do |msg|
  channel.send("")
end

client.run()
