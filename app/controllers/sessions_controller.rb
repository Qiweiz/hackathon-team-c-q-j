class SessionsController < ApplicationController

	def login
		username = params[:username]
		user = User.find_by_username(username) || User.create(:username => username)

		render :json => user.to_json, :callback => params['callback']
	end

	def logout
	end

	def get_tweets
		# num_pages * 200 = number of tweets generated
		num_pages = 2

		# Generate random tweets
		trend_query = twitter_client.trends.collect{|t| t.query}.sample
		random_max_id = nil
		random_tweets = []
		num_pages.times do
			tweets = twitter_client.search(trend_query, :lang => "en", :count => 100, :max_id => random_max_id).statuses
			random_max_id = tweets.collect{|t| t.id}.min

			tweets.map! {|t| {
				:name => t.user.name,
				:username => t.user.screen_name,
				:avatar => t.profile_image_url,
				:content => t.text,
				:time => t.created_at.strftime("%b %d"),
				:points => -10
			}}
			random_tweets += tweets
		end
		
		# Generate target tweets
		# hashtag1 = "##{params[:hashtag1]}"
		# hashtag2 = "##{params[:hashtag2]}"
		hashtag1 = "#soccer"
		hashtag2 = "#football"
		target_max_id = nil
		target_tweets = []
		num_pages.times do
			tweets = twitter_client.search("#{hashtag1} OR #{hashtag2}", :lang => "en", :count => 100, :max_id => target_max_id).statuses
			target_max_id = tweets.collect{|t| t.id}.min

			tweets.map! {|t| {
				:name => t.user.name,
				:username => t.user.screen_name,
				:avatar => t.profile_image_url,
				:content => t.text,
				:time => t.created_at.strftime("%b %d"),
				:points => 10
			}}
			target_tweets += tweets
		end

		# Randomize tweet order
		tweets = random_tweets + target_tweets
		data = {:tweets => tweets.shuffle}

		# Return JSONP
		render :json => data.to_json, :callback => params['callback']
	end

end
