ActionMailer::Base.smtp_settings = {
  :address => 'smtp.gmail.com',
  :port => 587,
  :authentication => :plain,
  :user_name => 'web@nuklei.com',
  :password => '992E38'
} 

class CustomerMailer < ActionMailer::Base
  def question_email(msg)
    from 'web@nuklei.com'
    recipients 'info@nuklei.com'
    subject 'Website Email!'
    body msg
  end
end




