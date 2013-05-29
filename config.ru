use Rack::Static, 
  :urls => ['/public', '/vendor', '/focus'],
  :index => 'public/index.html'

run Rack::File.new('public/')
