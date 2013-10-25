class SessionsController < ApplicationController

	def get_tweets
		# Create/get user
		username = params[:username]
		user = User.find_by_username(username) || User.create(:username => username)
		user = {:id => user.id, :username => user.username, :scores => user.scores.collect{|s| s.value}}

		# Generate random tweets
		num_tweets = 150
		random_tweets = []
		trend_queries = twitter_client.trends.collect{|t| t.query}

		trend_queries.each do |query|
			tweets = twitter_client.search(query, :lang => "en", :count => 100).statuses

			tweets.map! {|t| {
				:name => t.user.name,
				:username => t.user.screen_name,
				:avatar => t.profile_image_url,
				:content => t.text,
				:time => t.created_at.strftime("%b %d"),
				:points => -10
			}}
			random_tweets += tweets

			break if random_tweets.count > num_tweets
		end
		
		# Generate target tweets
		hashtag1 = params[:hashtag1]
		hashtag2 = params[:hashtag2]
		num_pages = 2
		target_max_id = nil
		target_tweets = []
		num_pages.times do
			tweets = twitter_client.search("##{hashtag1} OR ##{hashtag2}", :lang => "en", :count => 100, :max_id => target_max_id).statuses
			target_max_id = tweets.collect{|t| t.id}.min

			tweets.map! {|t| 
				hashtags = t.hashtags.collect{|h| h.text.downcase}
				points = hashtags.include?(hashtag1) && hashtags.include?(hashtag2) ? 20 : 10
				{
					:name => t.user.name,
					:username => t.user.screen_name,
					:avatar => t.profile_image_url,
					:content => t.text,
					:time => t.created_at.strftime("%b %d"),
					:points => points
				}
			}
			target_tweets += tweets
		end

		# Randomize tweet order
		tweets = random_tweets + target_tweets
		data = {:user => user, :tweets => tweets.shuffle}

		# Return JSONP
		render :json => data.to_json, :callback => params['callback']
	end

end
