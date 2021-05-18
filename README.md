Wech

1 - Put the `com.vaccine-bot.daemon.plist` file in your `~/Library/LaunchAgents/` folder<br />
2 - To launch the bot : run `launchctl load ~/Library/LaunchAgents/com.vaccine-bot.daemon.plist`. It will run automatically every 30 sec and send you a notification on your mac when it finds a slot. Just click on the notification and you'll be redirected to the medical center.<br />
3 - To stop the bot : run `launchctl unload ~/Library/LaunchAgents/com.vaccine-bot.daemon.plist`.<br />
4 - Since thousands of people try to book the few spots available at the same time, you'll see spots appear / disappear then disappear / reappear so don't give up !
