**! do not edit any of the `_site` folder content, it will be overridden by Jekyll and changes will be lost!**

Installing Jekyll:
`sudo apt-get install ruby-full build-essential zlib1g-dev`
`gem install jekyll bundler`


# Set up website locally

1. clone the git repository
2. install bundler: `sudo apt-get install bundler`
3. `bundle install`
4. `bundle exec jekyll serve`, changes to the page content will be automatically refreshed. You can specify `--host 0.0.0.0`.

# Deploy website on server

1. clone the git repository
2. install bundler: `sudo apt-get install bundler`
3. `bundle install`
4. `bundle exec jekyll build`
5. `cd _site`
6. `python3 -m http.server` will publish the website on port 8000 of the machine


# Once the server has rebooted

1. Launch a tmux session.
2. Move `~/lobsters` and run `rails server`.
3. Run project-based servers (`CREATE`).
