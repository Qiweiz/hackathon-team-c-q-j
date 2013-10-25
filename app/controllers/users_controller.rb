class UsersController < ApplicationController

	def update
		user = User.find(params[:id])
		score = params[:score]
		Score.create(:user_id => user.id, :value => score)
		user = {:id => user.id, :username => user.username, :scores => user.scores.collect{|s| s.value}}
		render :json => user.to_json, :callback => params['callback']
	end

end
