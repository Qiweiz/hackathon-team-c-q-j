TwitterShooter::Application.routes.draw do
  # You can have the root of your site routed with "root"
  # root 'sessions#login'

  put '/login' => "sessions#login"
  put '/logout' => "sessions#logout"
  get '/get_tweets' => "sessions#get_tweets"

  get '/users/:id' => "users#show"
  put '/users/:id' => "users#update"
end
