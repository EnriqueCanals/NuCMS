module NuCMS
  class Contact

    def initialize(app)
      @app = app
    end

    def call(env)
      if env['REQUEST_METHOD'] == "POST" and env['PATH_INFO'] == '/contact'
        res = CGI::parse(env['rack.input'].read)
        if res["bottrap"][0].empty?
          unless res["name"][0].empty? or res["info"][0].empty? or res["note"][0].empty?
            msg = "" << res["name"][0] << "\n\n" << res["info"][0] << "\n\n" << res["note"][0]
            CustomerMailer.deliver_question_email(msg)
          end
        end
        [302, {"Location" => "/thanks", "Content-Type" => "", "Content-Length" => "0"},[]]
      else
        @app.call(env)
      end
    end
  end
end
