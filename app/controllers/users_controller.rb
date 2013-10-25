class UsersController < ApplicationController

	def show
		user = User.find(params[:id])
		render :json => user.to_json, :callback => params['callback']
	end

	def update
		user = User.find(params[:id])
		score = params[:score]
		Score.create(:user_id => user.id, :value => score)
	end

end
