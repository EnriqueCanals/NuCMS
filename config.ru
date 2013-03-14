require 'rubygems'
require 'bundler/setup'
require 'rack'
require 'nokogiri'
require 'erb'
require 'cgi'
require 'action_mailer'
require 'rack/contrib'
require 'net/smtp'
require './lib/customer_mailer'
require './lib/content'
require './lib/contact'
require './lib/template'
require './lib/template_methods'
require './lib/blog'

use Rack::ETag
use NuCMS::Contact
use NuCMS::Blog
use NuCMS::Content
use Rack::Static, :urls => ["/css", "/images", "/js", "/javascripts"], :root => "template"
run Rack::NotFound.new('404.txt')

