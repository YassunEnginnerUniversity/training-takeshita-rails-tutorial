module Api
  class UsersController < ApplicationController
    before_action :logged_in_user, only: %i[index show edit update destroy followees followers]
    before_action :correct_user,   only: %i[edit update]
    before_action :admin_user,     only: :destroy

    def index
      # @users = User.paginate(page: params[:page]) # will_paginate
      @users = User.page(params[:page]) # kaminari
    end

    def show
      @user = User.find(params[:id])
      # @posts = @user.posts.paginate(page: params[:page]) # will_paginate
      @posts = @user.posts.page(params[:page]) # kaminari

      # 各ポストに対してcurrent_userがいいねをしているかを確認
      @posts = @posts.map do |post|
        liked = post.likes.exists?(user_id: current_user.id) # current_userがいいねをしているか確認
        post.attributes.merge(user_name: post.user.name, liked: liked) # likedを追加
      end

      render json: { user_info: { user_id: @user.id, name: @user.name, registration_date: @user.created_at, followed: current_user.following?(@user) }, posts_info: @posts },
             status: :ok
    end

    def new
      @user = User.new
    end

    def create
      @user = User.new(user_params) # 実装は終わっていないことに注意!
      if @user.save
        @user.send_activation_email
        flash[:info] = 'Please check your email to activate your account.'
        redirect_to root_url
      else
        render 'new', status: :unprocessable_entity
      end
    end

    def edit
      @user = User.find(params[:id])
    end

    def update
      @user = User.find(params[:id])
      if @user.update(user_params)
        flash[:success] = 'Profile updated'
        redirect_to @user
      else
        render 'edit', status: :unprocessable_entity
      end
    end

    def destroy
      User.find(params[:id]).destroy
      flash[:success] = 'User deleted'
      redirect_to users_url, status: :see_other
    end

    def followees
      @title = 'followees'
      @user  = User.find(params[:id])
      # @users = @user.followees.paginate(page: params[:page]) # will_paginate
      @users = @user.followees.page(params[:page]) # kaminari
      render 'show_follow'
    end

    def followers
      @title = 'Followers'
      # @user  = User.find(params[:id])
      # @users = @user.followers.paginate(page: params[:page]) # will_paginate
      @users = @user.followers.page(params[:page]) # kaminari
      render 'show_follow'
    end

    private

    def user_params
      params.require(:user).permit(:name, :email, :password,
                                   :password_confirmation)
    end

    # beforeフィルタ

    # 正しいユーザーかどうか確認
    def correct_user
      @user = User.find(params[:id])
      redirect_to(root_url, status: :see_other) unless current_user?(@user)
    end

    # 管理者かどうか確認
    def admin_user
      redirect_to(root_url, status: :see_other) unless current_user.admin?
    end
  end
end
