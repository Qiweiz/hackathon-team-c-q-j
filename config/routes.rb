TwitterShooter::Application.routes.draw do
  # You can have the root of your site routed with "root"
  # root 'sessions#login'

  get '/get_tweets' => "sessions#get_tweets"
  get '/users/:id' => "users#update"
end
