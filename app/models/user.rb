class User < ActiveRecord::Base

	has_many :scores

	def as_json(options={})
		hash = super(options)
		hash[:scores] = scores
		hash
	end

	def scores
		scores.collect{|s| s.value}
	end

end
