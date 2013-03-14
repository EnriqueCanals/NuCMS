module NuCMS

  class Blog
    def initialize(app = nil)
      @app = app
    end

    def call(env)
      if env['PATH_INFO'] == '/blog'
        [301, {"Location" => "http://blog.nuklei.com", "Content-Type" => "", "Content-Length" => "0"},[]]
      else
        @app.call(env)
      end
    end


  end


end
