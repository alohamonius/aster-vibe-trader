# tactiq.io free youtube transcript

# No title found

# https://www.youtube.com/watch/oI0vHRAUqxs

00:00:00.000 No text
00:00:00.080 Binance just launched a brand new exchange and we built a trading bot for it and I show you everything here in
00:00:05.200 this short video. If you log in, you'll see absolutely everything and you'll also see a deep analysis of uh what is
00:00:12.880 the value of Aster. This is Binance's new exchange. You know, CZ is
00:00:18.000 essentially backing this, but um what's the valuation and how to build a trading bot for it. So, um, really quickly, I'll
00:00:24.800 go ahead and show you the bot that we built, but you'll be able to see everything here inside of the actual
00:00:31.119 video if you stick around. The only thing I do ask is you do tap the like button. Um, I was able to build this in
00:00:37.120 such a short time because, uh, I've built a lot of bots in the past. So, here you go. Here's all the code. Nick
00:00:44.800 says, "Bro, build anything is so easy now. I literally built my own Whisper Flow because it wasn't working on
00:00:50.239 Windows." Nice, dude. That's so sick. Okay, so here's all the code for the bot that we built. I'll show you more in
00:00:55.520 depth during the video and like I said, you want to stick around because I figured out the true valuation for Aster
00:01:01.920 and you'll see exactly how I worked on that math model in order to kind of price it because right now it's only
00:01:08.400 been out for a day and is it going to be bigger than Hyperlid? I'm not here to say that it is or it isn't, but I do
00:01:15.680 know CZ is a vicious competitor and it's something to look out for. But you'll see all the numbers and the number I
00:01:22.000 came to here in this video. If you do stick around, I'm scrolling through this code, but you can go ahead and pause the
00:01:27.439 video at any time in order to copy the code down. This is all of the code needed in order to build a trading bot
00:01:33.119 here on Aster Dex, which is brand new, and I don't think anybody else in the
00:01:38.159 world has shown this. So, um, I'm excited to bring this to you here, and I
00:01:44.320 hope you enjoy this video. Go ahead and tap the like button, subscribe, and I'll see you inside. Let's get it. lock in.
00:01:50.320 All right. Today we are building a bot for Aster Dex. Astrodex is Binance's new
00:01:55.600 perpetual um crypto exchange and essentially it's
00:02:01.600 it's a competitor of Hyperl liquid and as you know we're one of the first to ever build for Hyperlid and we built
00:02:08.959 some of yeah probably the first B bots launched on Hyperlid and went through
00:02:14.319 the documentation when it was very very young and I think Aster Dex will get
00:02:20.400 some of the volume I'm not saying all of it not saying it's going to flip I'm not saying any of that stuff. I do want to
00:02:25.440 analyze the opportunity as well. See how much growth it has ahead of itself. So,
00:02:31.440 I'll be kind of doing both today. So, I have my Hyperlid trading bots here, and you can see there's a bajillion back
00:02:37.440 test that we've been working on the last couple weeks here. But, I also have all these bots here. And you can see under
00:02:42.800 the Hyperlid tab here, you know, um, a bunch of market makers and seeing
00:02:48.080 people's positions and things like that. So, we're going to go ahead and dive all the way in here and build absolutely
00:02:54.400 everything that is needed. Um, but make sure that you know this is non-financial advice.
00:03:03.760 Everything I'm doing here is uh me just building for myself. And if you want to see this, you can. And if not, then
00:03:10.000 No text
00:03:10.239 that's cool, too. But um I'm going to dive right into it. And the first thing I'm going to do is I'm going to start a new GitHub. Okay? So, let's get a new
00:03:15.760 GitHub and call this Astra Exchange Trading Bots. Okay? So let's go here and say add new create new GitHub and say
00:03:23.120 aster aster dex I guess is what they call it
00:03:28.560 dex trading bots. Okay.
00:03:34.799 Create repo. Publish repo. Publish repo. Copy path.
00:03:41.920 Copy path. Copy repo path. Okay. Let's go up in here and say cd up in there.
00:03:47.680 Okay. code. Okay. Okay. Now, we have our aster up. And
00:03:53.360 what I'm going to say, I'm just going to make a read me real quick just so I can get Claude up. It's really weird how she
00:03:58.879 doesn't pull up until until we do this, but whatever.
00:04:04.239 MD. Okay. And then I go here and I say, "Claw, dangerously skip permissions
00:04:10.159 because we don't do it any other way." Damn. Double that does that, too. Claude
00:04:17.839 Claude, dangerously skip permissions. Okay, dangerously skip
00:04:26.080 permissions. Perfect. Okay, let's go ahead and say um
00:04:33.120 let's give it access to our hyperlquid bot or one of them. Um, here. Let's just
00:04:39.199 put Well, mm41 looks nice and sketch like it's not on the GitHub, so I like
00:04:46.400 that. Let's give it m2 copy path.
00:04:55.680 Here's an example of a hyperlquid bot. And you can use the nice funs file in that same directory. It has pretty much
00:05:00.960 all of my functions. That file that I attached you to and then the nice funs in that same directory. Okay, so now you
00:05:06.720 have all of the functions I will need in order to rebuild a new bot. Now, we're
00:05:12.080 building for a new exchange here. The exchange is Aster Exchange. I'll give you all the documentation below, but
00:05:18.960 essentially you're going to need to build rebuild MMO2 and I need you to build it for Aster
00:05:25.520 Exchange.
00:05:30.560 And here's the documentation. The reason I gave you the hyperlquid
00:05:36.880 stuff is because I have figured out all of the buys, sells, etc. and the things I need for the MMO 2 in order to um
00:05:46.240 guide you and exactly what I want to build here for the Aster exchange.
00:05:53.039 Okay. Now, let's go find the documentation here. Okay. Let's go here to API management.
00:06:00.400 Maybe create API key. Learn more offers APIs for real time
00:06:09.120 trading. Learn more. Okay, so this is the API documentation. Aster finance
00:06:16.720 futures API
00:06:25.280 Binance spot API.
00:06:30.560 I'm going to start with futures.
00:06:36.240 So we have general info signed market data test order book. Okay. Recent
00:06:40.000 No text
00:06:41.280 trades list. Okay. Market price. Okay. Get funding rate configuration. Okay.
00:06:46.560 Websocket. Okay. So, this looks pretty in-depth, which is good and it makes sense if it's coming from Binance.
00:06:56.800 Just want to peek in here real quick before I just let her have at it. Um, order book, mark price, get funding,
00:07:04.800 trade streams. Okay, they're probably sharing a lot of this account trades, endpoints, place multiple orders. Oh,
00:07:11.440 nice. I like that. Cancel orders. Cancel all orders. Um
00:07:16.639 here, let's put new order. Let's see what that looks like.
00:07:26.160 All right, let's go ahead and let's run it. Let's run it, dude. Let's run it.
00:07:34.160 Aster API document. Okay, here's the documentation.
00:07:42.639 All right, go ahead and build. Yo, what's up, Rico? How you doing, dude? Good to see you, man. 777.
00:07:49.199 Life is not about finding yourself. Life is about creating yourself. Wow. Dolly
00:07:54.560 lolly dascal. Beautiful. Okay. Now, I also want to go
00:08:00.319 ahead and do some evaluations here. Um, hyperlquid.
00:08:05.520 Hyperlid aster.
00:08:14.319 Okay, let's go ahead and put all the hyperlquid stuff down first. I just want to see what the value for this would be.
00:08:21.680 Um maybe chat GPT can help as well.
00:08:29.280 Let's go to um aster spot.
00:08:43.440 Um let's go to Coin Gecko. Okay. Let's go to Aster as well. Yep.
00:08:50.080 Just give it a bunch of information. Why is it at 50 cents on 57 cents here but 47 cents here?
00:08:59.839 Um,
00:09:05.600 markets. It's only on Bing X. Holy smokes. So, there's an arbitrage right there.
00:09:15.600 That's weird.
00:09:23.680 That is very weird.
00:09:29.519 Bing X. Bing X. Okay, so Claude's created everything and I've already
00:09:34.880 thought everything through on Hyperlid, so it's pretty chill.
00:09:41.600 Markets here. Let's go to Aster
00:09:52.320 spot. It's at 55 cents here. Is that just
00:09:58.160 because it's easier to buy or something? Holy smokes. It went up to a dollar here.
00:10:05.200 There's no way this is arbitrage right now.
00:10:10.959 Bing X. Bing X. Um, Bing X
00:10:18.000 KYC
00:10:32.240 unverified 20,000 USDT withdrawal fiat currency. Um, this is arbitrage if I'm
00:10:41.200 not hallucinating, right?
00:10:46.800 Am I tripping? 47 cents to 56 cents. Is it hard to buy
00:10:54.000 or something? Aster USDT.
00:11:02.880 Are there trades going through? 834. Not a lot of trades going through.
00:11:10.800 So maybe not a lot of volume. 1.52 135
00:11:15.839 18. Um, that's the arbitrage.
00:11:20.959 pretty sure, but
00:11:32.640 let me try to get connected to Aster first off and see if I can buy the token
00:11:37.920 and then I have to try to figure out if I can get connected on Bing X asterex
00:11:49.120 launch app connect via Solana
00:11:55.279 Phantom detected. Yes. Send request sign is free. Okay.
00:12:00.000 No text
00:12:05.200 Okay. Confirm.
00:12:18.399 see if I can buy the token because I might just do this ARB while
00:12:24.079 this is happening. And don't front run me, please. Okay, I'm going to try to sign up for
00:12:29.680 Bing X as well. Bing X, please don't front me, dude.
00:12:42.000 Please, please, please, please,
00:12:47.279 please, please, please. So, I'm still working on this. You can see it's still building. So, that's far.
00:13:16.800 And you can see it's making the mmo2 here for aster based on the hyperlquid. So you can see it's already coding out.
00:13:23.120 It made this beautiful moon dev. It looks like moon decks. But what's up dry? How you doing bro? Good to see you.
00:13:29.360 Good to see you. Good to see you. So I'm in there. No, not quite but verifying.
00:13:39.200 Okay, I do have Let's do a limit order here. Size.
00:13:46.160 I don't know why BTC, bro. The Ellie
00:13:52.320 crazy dude. How do I get on over to
00:14:03.519 launch app? Love your content. Thank you, dude. Appreciate you. I love you, too.
00:14:16.000 Market USDT. Oh, I don't have a USDT. I just put
00:14:23.040 USDC in there.
00:14:28.800 USDC to USDT. Okay, let's change that. Transfer that market.
00:14:34.959 Sell maybe transfer
00:14:40.399 to spot. Yep. So you got to transfer to spot. Transfer USDC to spot.
00:14:54.800 Okay. And then I'm going to sell my USDT. Now I have USDT and I'm gonna buy Aster
00:15:02.639 here I think. Buy um limit price please
00:15:10.959 limit up there price buy.
00:15:20.320 Oh looks like she's done dude. Okay so let's see what she says. She
00:15:25.600 says Dr. data. I've successfully built the MMO2 for Aster Exchange. Here's what I created. Files created Aster API
00:15:31.600 complete API wrapper for Aster Exchange with all essential endpoints, market data, order book, prices, K lines,
00:15:37.440 account management, balance, positions, order placement, and cancellation. Okay. Leverage and margin controls. Nice. I've
00:15:44.959 got my 100 Aster now. Um,
00:15:53.920 how do you withdraw it though? Ah, that's the caveat. That's the catch,
00:16:00.720 dude. Can't withdraw.
00:16:05.740 [Laughter] There's an arbitrage, but you can't withdraw.
00:16:35.519 Okay, that's interesting. Let's see if I can figure
00:16:40.639 out how to withdraw. So, spot.
00:16:46.240 I should have Aster here. Oh, you Yeah, you can't withdraw. So, I'm over here.
00:16:53.279 Um, I'm over here right here trying to withdraw this aster I just bought. I
00:16:59.279 just top blasted. I only bought 50 bucks worth to um
00:17:05.439 take advantage of this arbitrage. But you can't do that. So that's the
00:17:12.079 reason there's an arbitrage transfer. Let's try some of this stuff. Transfer. I can
00:17:20.400 spot transfer. See, I can't access the spot there. Um,
00:17:34.160 goodbye.
00:17:46.480 Yeah, I mean, whatever. That was fun. And I was excited there for a very quick second that I was about
00:17:52.799 to have a fat arm and I was going to I was going to put everything on this ARB. What's up, George? How are you? 777,
00:17:58.640 dude. What's up, dude? 777's my refuge. Hey, man.
00:18:04.240 Transfer withdraw. So, withdrawals just don't work in general. Yo, JP, what's up, bro? 777.
00:18:14.700 [Music] That's weird.
00:18:24.559 Anyways, I'll I'll go ahead and deposit a little bit more just to um
00:18:34.480 just to um have some to test these orders and stuff
00:18:41.600 cuz if it's anything like Hybrid Liquid, there will be an airdrop. I just don't know how that is going to
00:18:48.559 be played out. So, let's go ahead and make a list here.
00:18:54.960 Aster, I need to figure out the valuation. I need to figure out the airdrop
00:19:00.640 situation. I need to figure out those two things. What's up, dude?
00:19:08.480 Your mic is so low. Oh, man. I'm sorry.
00:19:15.120 Let me go ahead and try to fix that for you.
00:19:22.080 How's it now, Maxima? I might be speaking a little low as
00:19:27.840 well. I got some family in town visiting, so I'm trying to not wake them up yet.
00:19:36.480 Oh, it's not okay. Your headphones are low. Everybody else, how's the How's the
00:19:42.880 sound? Should I keep it like how it is or should I go higher or lower?
00:19:49.360 Sounds good. I upped it a little bit.
00:19:55.360 But now you're going to hear my dog bark.
00:20:01.760 Okay. So, the arbitrage might be there, but you can't remove it or you can't take it out. Um, I just speaking I think
00:20:10.000 you just speaking so calmly sound sexy, baby. Live and good. Better. Okay, cool.
00:20:15.840 Yeah, I'm just trying to not yell today cuz I got people sleeping in my living room. So, I'll just turn up the uh the
00:20:22.880 input. Please excuse my dog that you now probably will hear. Um, it's better now.
00:20:29.280 Okay, I'll keep the mic pretty close to me as well. Next few days. Next few days. Um, okay. So, what I want to do
00:20:36.880 now is I'm going to deposit a little bit more
00:20:42.720 into Aster because I did just spot buy that.
00:20:49.280 I suppose I could sell it, but yolola
00:20:55.280 deposit. Just throw a little bit up in there.
00:21:00.480 20
00:21:08.000 Looks like I bought some houses here earlier today.
00:21:13.200 Deposit. Okay, I'm going to confirm dub up in there.
00:21:25.919 Also want to go to that house coin bot here. House copy path
00:21:30.000 No text
00:21:31.919 copy repo path cd in there code dot.
00:21:41.440 Okay, beautiful.
00:21:52.320 Okay, sick. Um, this should be done. I just need to go ahead and update myv. So
00:21:58.159 she said she made the aster API py. Okay. The mm2 aster mainbot implements
00:22:04.799 with your liquidation hunting logic adapted from your hyperlquid bot.
00:22:12.960 Market analysis based on order book position history. Aster funks helper functions including order management
00:22:20.240 position tracking kill switches. V example all necessary Python packages.
00:22:28.880 Let's see what the example shows. Okay. And then I'm curious about this mm
00:22:36.799 O2. If we look at this, you can see I have this part.
00:22:46.960 It looks like you're going to need to import this as well. And um
00:22:54.080 let's see. Maybe she did and she's just gaining it from somewhere else.
00:23:00.559 Yeah, because this will be our measure for the liquidations here. So you'll
00:23:07.360 have to put that into our real ENV, the actual Mundev key, and that will measure
00:23:14.720 our liquidations. So you can make a real ENV and then I'll fill in the the rest of the real ENV
00:23:20.640 with the actual Aster API keys and whatnot.
00:23:26.159 Try not to show it on my screen though. Live and good. What's up dollar? How are you doing?
00:23:33.280 All right. So now we have this done. I'm going to go ahead and close this. And
00:23:38.480 couple things I need to do here while this is working. I want to go to the read me and keep looking at this. The
00:23:43.840 hyperlquid verse aster. Okay. Um, I've kind of confirmed that I'm not able to
00:23:49.679 withdraw on Aster. So, that's super sketch. Maybe you're able to withdraw USDC,
00:23:57.760 but I can't withdraw
00:24:05.039 the actual aster or else I would be blasting this arbitrage right now. Is
00:24:10.400 this hinting at the price though? What is this? September 17th. How long ago was this?
00:24:19.200 15 hours ago. So last night. Is that hinting at the price up to 120? If it
00:24:26.320 is, I mean, that's interesting, dude. It's interesting. Okay, let's go to Hyperlid
00:24:33.760 here. Let's grab this Hyperlid.
00:24:40.000 Okay. And I know I started putting this in the chat GPT here, but I want to make the prompt here. Aster. Okay.
00:24:51.760 And you can see here added Munddev API
00:24:57.760 integration. Copied the API. py file and imported it to the main bot. Updated liquidation detection. Now uses real
00:25:03.039 liquidation data from Moonv API instead of simulated data. Create av file. Okay,
00:25:08.159 great. Double check that we're not using any um
00:25:15.600 any simulated data anywhere in this bot. If we are, make sure we're not. If you
00:25:22.159 need help, I'm here. Okay. So, she's going to do her thug
00:25:27.360 visel there. And I'm going to keep working on this. So aster um market cap's 15 billion for hyperlquid
00:25:42.960 mcap fdv. Hey,
00:26:02.000 let's go to exchanges here. Decentralized exchanges. Hyperlid
00:26:08.159 24-hour volume
00:26:16.400 24hour V.
00:26:23.200 Okay, got that. You can see this is done. No simulated fake data is being used. The bot is using real liquidation
00:26:29.600 data from the API, real market data from Aster exchange, live tickers, actual 24-hour price, real trading volumes,
00:26:36.159 live order book, real position data from Aster exchange, real order execution on Aster exchange. The analyze market
00:26:43.279 function uses real order book imbalances calculated from actual bid ass volumes from Aster's live order book. Everything
00:26:50.320 is pulling from APIs. No synthetic or simulated data anywhere
00:26:57.600 in the code. Beautiful. You know how Claude does that.
00:27:02.880 You know how she dooo. Let me go ahead and see if Aster's on
00:27:08.000 here yet. That would be super helpful. It's not. Okay. So, we have to kind of
00:27:15.120 build this out ourselves, I suppose. asterex.com
00:27:27.039 total trading volume open interest
00:27:32.400 TVL okay let's look at the open interest because I think we'll be able to get that
00:27:39.520 oi is that and then what is open interest for hyperlquid
00:27:48.559 hyperlquid
00:27:57.440 Hyper liquid open interest
00:28:09.840 open interest is 1.5B 1.47B 47B
00:28:19.279 and this would be 2.255B.
00:28:26.399 I think that's the way to analyze it for now. Open interest. Open interest is how many um
00:28:34.240 like how how much money is on the exchange live in trades right now. like
00:28:40.159 how much open how many open trades are in dollars amounts. If you had a million dollar long, that would be a million
00:28:46.240 dollars in open interest. But now there's 10,000 other people who have longs open at different sizes. That's
00:28:51.679 how they count open interest. Um, okay. So, funding rate, liquidations, long
00:28:57.679 short, hyperlid. Let's go see if there is um
00:29:03.919 Aster. So, nobody's got Aster yet. Um, what about Defi Llama?
00:29:10.480 Defy Llama Hyperliquid
00:29:19.600 fees annualized is 1.2 billion. Sheesh. TVL is 60 689 M.
00:29:33.279 689M.
00:29:43.919 Open interest is 14.8B. What the heck?
00:29:49.840 That's sketch, dude. It's way different.
00:30:01.600 Fully FDV is correct.
00:30:07.279 Outstanding FDV. It's tough, dude. It's tough when those
00:30:15.200 aren't correct. When they aren't the same. I'm kind of trusting DeFi Llama, though.
00:30:21.840 Dex volume 30 days. Herb volume 30 days.
00:30:37.279 TVL is 404M. TVL here is
00:30:50.960 fees, revenue, holders, revenue, incentives, earnings, DEX volume, per volume, open interest, market cap, high
00:30:57.520 price, fully dialed value, outstanding FDV.
00:31:02.559 Do you only trade crypto? Yeah.
00:31:08.480 Total value like is 689. Sorry. Okay. And they say Aster has a 404 TVL.
00:31:18.240 That's the thing that but that it's from them. TVL 404M. Ah, that's tough. 204 255
00:31:28.720 in um open interest. 2 million users. 516 billion.
00:31:36.640 Total trading volume. What is the total trading volume here?
00:31:46.159 shop 30-day
00:31:51.679 335 billion for 335 billion um 30-day 30day volume
00:32:01.519 335 billion we don't have that information for Aster
00:32:07.840 aster dex Um, trading volume
00:32:14.720 aster. Here we go. Sweet. It's helpful. 1.85
00:32:20.399 TVL now. Total value locked. Holy smokes. It jumped a lot yesterday, of
00:32:25.919 course. So, they got 1.8 billion TVL.
00:32:33.679 Wait, wait, wait, wait, wait. That's way bigger than
00:32:41.440 than Hyperliquid total value locked.
00:32:46.720 That can't be right, dude.
00:33:01.600 But they're probably playing games. They're probably playing. Oh, this is BS TVL. BSC Solana
00:33:08.559 Manta. I imagine they're playing games. I imagine this is mostly
00:33:15.360 CZ in them. Yeah, I imagine that. But maybe not.
00:33:23.840 Maybe not. Maybe not. I don't know. That's the tough thing. That's the tough thing about value. like I I need put in
00:33:32.640 a value to this. That's what I'm trying to do.
00:33:39.679 Um TVL open interest here is 3.62 million.
00:33:47.760 That's nothing. Her volume is 15 billion though.
00:33:58.399 30-day volume
00:34:03.840 is 30-day V 15.5.
00:34:21.040 I'm going to give it Defi Llama links here. and I've chat GPT analyze this
00:34:26.399 because I got some things I got to build. Okay, so let's go ahead here and
00:34:31.760 say
00:34:37.199 above are some links for you to explore. And we want to build out some sort of
00:34:43.839 model that applies a valuation to Aster Dex. Aster Dex is Binance's new um
00:34:51.520 perpetual DEX
00:34:57.200 and they're competing with Hyperlid. Okay, Binance is led by CZ as you know. He's
00:35:05.119 got a very big ego and he killed off Luna. He killed off FTX. He will fight
00:35:12.079 to be the number one per deck. But I want to look at this from a
00:35:18.000 strictly monetary volume, open interest, TVL, a
00:35:25.040 number basis. I want to look at from that stance because I think the
00:35:33.520 the kicker would be CZ's ego. The kicker would be that CZ will play dirty. That's
00:35:40.320 the kicker. But just numbers to numbers, I want you to thoroughly analyze this.
00:35:46.560 Look at those DeFi Llama links I sent. Look at any other links you can find.
00:35:55.520 I want you to then apply a valuation to the Aster decks. I don't think it's
00:36:02.240 correctly priced right now. I don't know if it's too high. I don't know if it's too low. But that's for you to for you
00:36:08.160 to um do some research on and give me a nice chart that is easy to read and
00:36:14.640 under understand. Okay. Thank you.
00:36:22.320 Okay. So, while she's doing that, I'm going to go ahead and get my keys ready here. I have my Aster Dex already pulled
00:36:28.880 up. So, I'll go over here to the more section, API management.
00:36:35.520 I'm just here API management. I went to more here API
00:36:41.839 management. I can't show you this part obviously because I create my API keys here and we are live
00:36:50.800 as always. I'm signing. Yo, what's up Hammad? How are you, bro?
00:36:57.760 Okay, so you get a API key and API secret key.
00:37:03.359 And I think that's all I need.
00:37:08.880 You know what I should do though is I should put my API uh my IP address on it
00:37:14.320 because I am live and I'll probably show my key here. So I'm going to delete that key here and
00:37:20.160 get my IP address.
00:37:29.280 I've got $20 and I don't care. I do not care. You can take 20 from me
00:37:35.760 if you can figure it out. Okay. So, I got my API key and my API
00:37:42.560 secret. Now, in the EMV example here,
00:37:49.520 the API key, API secret. Okay, I'm not going to show you those parts. I'm going to put in my regular here,
00:38:01.520 API key,
00:38:06.720 API secret. Okay,
00:38:13.440 then it looks like I need my other key here.
00:38:20.640 Train bots here. Let's go ahead and grab one more key here. My env
00:38:31.359 Oh yeah, I forgot I did that. That's smart.
00:38:52.320 So, what I do is I put on my EMV, I I put a bunch of space up top. So, if I do show you my EMV, then um you still can't
00:39:00.800 see it. So, I've learned that the hard way.
00:39:06.560 Hopefully, I didn't just delete it.
00:39:14.480 Okay. So, I put like a bunch of spaces in it
00:39:21.280 and then when I accidentally switch to myv like this, you can't see my
00:39:29.280 go ahead and close it out. Okay. All right. So, I've got my API keys set up and the bot should be working. It's
00:39:35.280 probably not going to work to be honest. Uh, we'll have to do a little bit of debugging, but um,
00:39:41.520 that's going to be slick. So, I'm just going to grab a cup of coffee. It will take me 2 seconds. And please read this.
00:41:29.200 All right. So, let's analyze this a little bit
00:41:34.240 while Okay, she's not working on anything right now, but that's okay.
00:41:39.680 I think both are equally important. So, let's go ahead and uh look through it.
00:41:47.119 I want to build the bot, of course, and I will build the bot, of course.
00:41:52.240 It will get done. That's absolutely for chisel.
00:42:46.400 Okay. So you can see it says perfect. I've verified the bot and can confirm no simulated fake data is being used. The bot uses real liquidation data from
00:42:52.800 Munda API. Okay. Yada yada real market data. Okay. Analyze market function. Okay. Perfect. You can see I do have
00:42:59.760 some cash in the per section here. Let's go ahead and see what's Gucci.
00:43:06.160 Um, I'm in there like swimwear. Uh, what's
00:43:11.280 up Orlando? What's up, Wishy? How you doing, bro? Um, I think
00:43:18.240 I can buy No, I can't. Can I? Huh? Buy. Oh, available 20. I have 19. Okay,
00:43:25.839 so it changes my USDC into USDT. That's nice. That's very, very nice. I'm glad that happens. Okay, we should be ready
00:43:32.000 to go. But first, I want to read through this because this is very important to me. I'm trying to figure out the valuation of the true valuation of this
00:43:39.119 or what it should be valued at. Um, I know the revenues or whatever are not the same. Volume's not the same. Um, but
00:43:47.599 our one comparable is Hyperlid. So, this is that's that all that's all I
00:43:54.079 have. And I have DeFi Llama and all that good stuff in order to give it a value. Okay. So, I gave it a prompt here. I
00:44:00.880 gave it a couple links. And now we're going to go ahead and analyze it. Use some pandas. Good. This a data dog FDV
00:44:06.480 here. Okay. Perfect. Perfect. Perfect. Aster. Build a simple data frame. Okay.
00:44:12.240 That looks good. Um, and this is what it came up with. Okay. So, let's go ahead and open this up. Um, Hyperlquid Aster
00:44:20.079 FDV. Damn, I can't read that. There's too many zeros, bro.
00:44:27.839 Asters at a 7 billion market cap. No, I can't read this though. I'm out.
00:44:35.520 Key ratios 30. Okay, these are some ratios that are good based on the latest figures. 30-day
00:44:41.839 volume divided by FDV 5.7 versus 4.39.
00:44:48.000 OI is.25 verse 05. So, it's a little undervalued
00:44:53.119 on both of those. TVL is um
00:45:01.760 okay 08 versus 0008 annualized revenue 02 verse 017
00:45:09.680 current versus fair value FTV under different anchors
00:45:15.200 current FTV is 3.54
00:45:20.640 for aster fair FTV volume parity is 2.68 68.
00:45:27.119 Okay. Aster FDV current verse fair value scenarios.
00:45:32.720 Current FTV fair FDV volume parody.
00:45:42.480 Here's a clean numbers only head-to-head and quick valuation read for Asterex versus Hyperlid. I pulled directly from
00:45:48.800 DeFi Lama and token trackers and then benchmarked Aster's valuation. Hyperliquids operate in multiples.
00:45:54.720 Download the chart. What the data says. Most recent snapshots. Hyperlquid 30-day per volume
00:46:00.560 is 335 billion.
00:46:06.000 Yeah. Okay. She's right. 24 is 12.39
00:46:11.520 billion. Is that fact though? They did 12 billion in volume yesterday. Holy.
00:46:21.520 I mean adds up 335
00:46:29.760 token hype market cap is 15.7 billion or FTV of 58 billion
00:46:37.040 HLP vault is 58M okay that's a good one protocol earnings is 96
00:46:43.599 million 30-day and 1.17 billion for one year
00:46:50.160 a 30-day per volume is 15.56 billion verse
00:46:56.720 this is volume okay 15 verse 335
00:47:02.319 24hour is 1.15
00:47:08.640 verse 12.39 token aster market cap is 735 million
00:47:14.319 but FDV is 3.54 billion
00:47:19.440 is that facts
00:47:26.880 coin market cap. Okay, it's at 45 cents. Good. Fully diluted is 3.6 Six
00:47:35.920 billion.
00:48:14.720 Circulating aster is 1.65 billion.
00:48:23.440 Okay. Looks factual.
00:48:32.000 Fees revenue 5.06. 30-day, but it's only been alive for a
00:48:37.680 day. Open interest in TVL. Aer's own site
00:48:44.640 shows OI is 211 million. TVL 303. Defi Llama's OI tracker currently reads only
00:48:50.800 singledigit millions likely under track. H little sketch. Quick operating
00:48:57.440 multiple 30-day volume FDV. So, Hyperlid has a 5.79x
00:49:04.480 from its 30-day volume to FDV. So, fully dilated value 58 billion 335
00:49:14.400 billion 30-day volume.
00:49:20.240 Looks like I just bought some cribs here. So, 737. Nice. Aster is 4.39x.
00:49:29.119 They have 15
00:49:39.920 billion 30-day volume. Don't know if I believe that though. It's a little tough to to
00:49:47.359 believe. I know I'm being super skeptical, but you know, it's probably a good thing.
00:49:57.200 Anyways, annualized revenue verse FDV is revenue
00:50:04.079 yield hyperlquid is 2%.
00:50:09.599 Verse 1.16. This is how many billions they make off their FDV. And this is how many billions they make
00:50:15.839 off their FTV. Again, it's only been alive for a day or so. I think they had a test night for test night
00:50:26.160 oi versus FTV. So open interest.256
00:50:34.319 is their amount. So 14.8 billion versus 58 billion and they have
00:50:41.119 2 billion versus 3.5 billion. Okay. Aster fair FDV scenarios benchmark to
00:50:47.280 hyperlquid using hyperlquid as the comp and holding AR's current fundamentals constant volume parody match
00:50:54.079 hyperlquid's 30-day v FTV multiple 2.69 69 FTV verse 3.54 billion
00:51:07.440 goes 24% to parody revenue revenue yield parity match HL's
00:51:14.640 annualized revenue FDV okay so it' be negative 16% the parody
00:51:21.520 OI parody match HL's OIF FDV using Aster's site OI
00:51:29.119 which is a little shady in my opinion.
00:51:34.240 Read on pricing numbers only on pure volume and revenue comps. Aster screens
00:51:39.839 somewhat rich 15 to 30% above HL parody today. If ASER's growth sustains V fees
00:51:48.640 compounding that premium can get earned and if not
00:51:54.319 there's room to revert towards a 2.7 or 3 billion FTV
00:52:00.319 on open interest the gap is wide. Either Aster's OI needs to ramp 900 million at
00:52:08.000 current FTV to match HL's OI FTV or FDV compresses.
00:52:15.440 Note DeFi Llama's OI feed appears to under capture Aster right now. I use Aster's
00:52:23.280 site OI. I mean, are you able to do this
00:52:31.520 last? Okay, they don't have open interest there because there's no input open interest.
00:52:36.640 Open interest.
00:52:44.800 I could do that. Actually, I'm going to have her do that. I'm going
00:52:50.880 to build a tool right now. So, I'm going to say this.
00:52:56.480 Uh, please look through the documentation and build a new file that is for open interest. We want to collect
00:53:02.400 the open interest for every single ticker they have. So, we'll have to loop through all the tickers and grab the
00:53:07.520 open interest for each ticker and figure out the total open interest on their exchange.
00:53:16.400 So, how do we do that? I don't know. We'll figure it out, though. As always, bro. As always.
00:53:24.559 As always. So, we'll be looping through I think
00:53:29.760 they have 101 tokens and we'll grab the open interest using the API as it showed in the documentation. Build this as a
00:53:36.400 new file and call it total open interest. That's going to be slick, bro. It's
00:53:41.680 going to be super slick
00:53:46.720 because nobody has the open interest correct. Hyperlid remains. Okay. So note
00:53:52.800 defy llama's oi feed appears to be under capture of aster right now. I use aster
00:53:58.000 site oi hyperlquid remains the th throughutook king 30-day per ball north
00:54:03.200 of 335 billion with premium revenue scale and deepi which supports his
00:54:08.319 higher FDV. One step says they have one functionality that hyperlquid doesn't
00:54:14.160 have. You can mask your order on aster.
00:54:19.359 Can't do you have to like do something specific to hide your order?
00:54:26.800 I know that Hyperliquid is all open.
00:54:33.920 Like I could pull up everybody's positions right now if I wanted to.
00:54:39.119 Hyperlquid remains the throughput king. 30-day per volume worth north 335 billion with premium revenue scale and
00:54:45.920 deep OI which supports its higher FTV. Caveats should you should know data source mismatch on asteroi verse defy
00:54:54.000 llama. I favor the site OI for fairness. If site OI is overstated or transient
00:55:00.480 the OI parody case becomes even tougher. Okay. So
00:55:07.040 she's working on building a script in order to get the true OI.
00:55:12.480 Uh press reports or TVL definitions differ.
00:55:17.520 HL's HLP vault vers a site report TVL. I didn't use TVL to anchor valuation
00:55:24.720 because PERBs are volume/fe driven press reports note CZ's visible support of
00:55:30.720 Aster. I did not factor this qualitative kicker into valuation only the numbers
00:55:36.559 above. If you want I could extend this with a small pier set.
00:55:42.079 No, I'm good. Okay. So, let's go ahead here and see what she said. Perfect. Dr. data dog. I've created to total open
00:55:48.799 interest. It fetches all trading symbols from Aster exchange. They have 101 plus loops through each ticker to get the
00:55:55.200 open interest. Calculates total open interest and volume in both contracts
00:56:00.480 and USD value. Matter of fact, dude, matter of fact,
00:56:05.760 24-hour volume. I want this to get volume as well. So, I want the 24-hour
00:56:11.040 volume and I want the open interest. So, it needs to loop through and grab both of those for each of the symbols. And at
00:56:16.640 the end of the day, it should be able to get the uh total open interest and total volume, 24-hour volume for the exchange.
00:56:24.079 So, we have the true numbers. Okay, this is great. And we need this
00:56:29.119 stuff anyways for our bots. It's way better for institutional traders. They can hide from us and our algorithm
00:56:34.880 against them. Okay, that's a good point, dude. I I'm curious. Is that by default or do you have to take a box or
00:56:40.559 anything? I'm assuming this by default, right? So, by default, all this is just more of like a centralized hidden order
00:56:47.599 book or not order book, but orders and hidden um stop- losses, take profits,
00:56:53.280 and hidden positions. I like that about Hyperlid, but I'm retail. You know,
00:57:00.720 somebody putting like billion dollar positions probably isn't too happy about Hyperlid doing that. So,
00:57:09.040 look on the main page of Pastor. I saw that um little thing. I didn't see if there was more information. I'll check
00:57:14.240 it out. Thank you. Uh I saw the little note. Invisible orders. Hidden orders let you place limit orders that stay
00:57:21.040 fully hidden from public order book. Size and one direction and direction are not shown.
00:57:27.920 So, invisible orders, visible advantage. I wonder if it's okay. Hidden order.
00:57:34.960 You have to click hidden order. Okay. Interest. Oh, I see it on my exchange as well.
00:57:42.960 See right here. Hidden order.
00:57:49.280 So, the price and size of these orders are not visible in the public order book.
00:57:58.480 Holy smokes. Okay. This is different than I what I was thinking, dude. I thought you were saying that you can't
00:58:04.240 see positions. You can't see it on the order book
00:58:11.119 are not visible in the public order book and are only disclosed after the trade.
00:58:17.280 I mean that's kind of sketch to be but maybe that will bring in some institutions for them. That's means more
00:58:24.640 OI. That means more volume probably. That's crazy though.
00:58:32.400 Yo, Jimmy, what's up, dude? 777, fam. Dang. Has it has the stream restarted
00:58:38.960 yet today? Cuz yesterday we were having some problems. Bullish. Yeah, I agree,
00:58:44.880 dude. I agree. That's bullish for institution.
00:58:51.920 Um, yeah. How's the stream quality been today? Is it is it restarted or anything?
00:58:58.000 Cuz yesterday we were having some problems. Okay, so let's see what she did. Okay, perfect. Dr. D, I've updated
00:59:04.079 the total open interest script to collect both open interest and 24-hour volume for all symbols. Here's what it
00:59:10.160 does. What's new? Fetches both OI and volume. Single API call to get the 24-hour ticker data. Nice. Loops through
00:59:16.799 all symbols. Calculates the two key totals.
00:59:24.799 Uh total open interest sum of all OI total 24-hour vault sum of all trading
00:59:31.599 vault perfect OI ratio okay to run just run that okay uh the script will output
00:59:38.160 progress as it fetches okay let's get it total open interest
00:59:45.599 rename that to total OI and Yeah.
01:00:00.000 No text
01:00:03.040 total volume. I'll be back in two seconds. Give me two
01:00:08.319 seconds. Remove all emotions and actually automate your trading. I can
01:00:13.920 show you from a point of not knowing how to code at all. If you don't know how to code at all, I can show you exactly how
01:00:20.000 to code and then I can show you exactly how to automate your trading.
01:00:25.119 You can see there's hundreds of reviews. I'll show you at the bottom. And there's a 100% money back guarantee. And the
01:00:32.079 price is super inexpensive. 69 bucks. And I will literally hold your hand step
01:00:38.000 by step. I'll rename it. Perfect. Okay, let's go ahead and run it. See what we get here. So, this should get the real
01:00:45.440 open interest and stuff and then we'll be able to feed it back.
01:00:50.640 The alley new new GitHub new new GitHub new GitHub
01:00:56.640 new GitHub. Who this new GitHub every day? A new GitHub GitHub. New
01:01:03.520 moon. New day. New moon. New day. New moon. Okay.
01:01:09.520 So, we got Okay. Let's see how this is looking. Let's see how this is looking. Okay. Um, okay. So, BTC it says there's
01:01:16.799 188 million. Yeah, we got these. We got this. We got this unlocked. We got this unlocked. Got this gang by snack. 221.
01:01:26.000 21 21. 47 million open interest. Okay. 21. So,
01:01:32.559 okay. Look at that. We got all the open interest coming through now. Hey, bro. What's up, bro? I seen this yesterday as
01:01:39.760 well. Binance Mafia. Okay, that's so good. The Cabal's coming for you. Hey bro, how
01:01:46.480 do you run your back test with L2 data? Are you using AWS three buckets when
01:01:51.520 training ML? I was for the OSI stuff. I was grabbing
01:01:58.160 it from the AWS, but then I started collecting it. So, I actually have it
01:02:03.520 being collected on my server right now. It's probably busted my server at this point, but we'll see.
01:02:10.559 But um yeah, that's exactly what I did. The AWS parket thing. Somebody came in here. I
01:02:16.960 forgot his name. Dylon. Yeah, Dylon. Shout out to Dylon. He showed me how to do that. So I I don't I didn't really
01:02:22.880 use AWS like that before. It's pretty cool. Oh my goodness. They have Apple stuff
01:02:28.960 here. Not that it's that cool, but Apple. They
01:02:34.960 do. They have 50x Apple.
01:02:40.799 Holy moly. See, go to stocks here. Want to see what's got the most volume.
01:02:47.040 24-hour volume. Not Not much, huh? 35,000. Yeah, that's not going to work.
01:02:52.960 You're going to have to fix that.
01:03:10.079 You're going to have to fix that.
01:03:19.630 [Music] Okay, there we go. So, beautiful.
01:03:35.599 So fartcoin for example, it doesn't look like it has much either.
01:03:41.200 All markets. Okay. So let's go ahead and go back to
01:03:47.440 chat GBT here.
01:03:57.039 I went ahead and used the API to grab the real total open interest and the
01:04:03.760 real 24-hour volume for Aster Dex. Please go
01:04:09.680 ahead and reanalyze this stuff now that we have the real
01:04:16.960 information. Actually, matter of fact, matter of fact,
01:04:27.200 go ahead and do the same exact thing. Same file OI and volume for Hyperlid.
01:04:34.480 Now, you can use the Yeah. Yeah. You have I'll give you the
01:04:40.000 link to my Hyperlquid bots and you already know how to build this, so it's super easy to do. So I just want them
01:04:45.280 total OI and volume HL which will be a direct comparison to make sure that we
01:04:51.359 have apples to apples. Um and analyzing the valuation of both.
01:05:00.319 Okay. So I should have probably given her some examples here. Let's just see if she can do it. Do you hire chips?
01:05:09.920 Do you hire chips from Prime Intellect to train models faster? Uh yeah, I uh
01:05:16.640 when I was doing a lot of machine learning stuff, especially for the gradical evolution, I wasn't using Prime Intellect. It was cool. I like Prime
01:05:22.319 Intellect, but it was a little less stable than um
01:05:27.599 Lambda Labs. Lambda Labs a little more expensive though. So,
01:05:33.680 I think it just depends on how much wear and tear you're going to have. But I was
01:05:39.839 running some really powerful uh GES Radical Evolutions and they were
01:05:46.559 breaking it. I was running like six at the same time though. So when I just let it beat one, it wouldn't break it. But
01:05:53.839 I found that it was more sturdy over there at
01:05:59.280 um Lambda Labs, just more expensive. So just depends
01:06:05.280 if you're not going to push it too hard. Like I over pushed it, I think. And I even sometimes broke lander left.
01:06:13.760 So, no way. You're done already.
01:06:20.319 Let's check it out. [Music]
01:06:26.799 207 symbols. Okay. How'd you get that so quick?
01:06:47.680 How was that so fast?
01:06:56.799 How was it so fast to do that? It was took so much longer on Aster. It seemed like you looped through each one of them
01:07:02.720 when I asked her. But then on Hyper Liquid, it just popped out in no time.
01:07:16.240 Look at DeFi Lama here. 24-hour volume,
01:07:23.760 revenue, earnings,
01:07:36.720 open interest. Okay, so it's about the same. Yeah.
01:07:43.280 Okay, cool.
01:07:53.039 Let's see here. Great observation, Dr. D. The speed difference is because of how the tool exchanges structure their
01:07:58.160 APIs. Has to make two three calls per API on Aster. Hyper liquid's fast gets
01:08:03.920 everything in two three calls total. Okay. Request type all mids. Okay.
01:08:11.599 The key difference as requires open interest call one symbol at a time. Hi liquid has meta and assets. CTX returns
01:08:18.719 all symbols data. Okay, sig.
01:08:27.279 So above is the aster 24-hour volume and aster open
01:08:33.920 interest and that's certified. Below is the certified again pulled from the API
01:08:40.319 hyperlquid open interest and 24-hour volume. Now that you have the true numbers, no fugazi or anything like
01:08:46.960 that, go ahead and give me an analysis again and then try to price
01:08:52.560 price the asset aster based off of hyperlquid
01:08:58.399 and explain it to me. Thank you.
01:09:04.399 All right, dude. I've been reading the ridge regression using online learning
01:09:10.560 is possibly the best method because it's least likely to overfit and adapts to
01:09:15.920 the market with minimal parameters. Apparently, market micro structures is often linear. Okay. Okay. Sounds like
01:09:23.679 you're going down a pretty good path, dude. I'm excited to keep hearing from you. See what you find out, dude.
01:09:33.439 Probably need to read that as well. Do you have a book or something that
01:09:39.359 you're reading it from? Or a video or something? Book or a video?
01:09:51.198 Book or a video? Video or a book.
01:10:02.640 All right, let's go ahead and see how this bot's doing. by the way. See if we can uh let's make sure. Okay, double
01:10:08.320 check my mm O2 that we built and make sure that it doesn't print out any keys or anything. I'm about to run it and I'm live here
01:10:16.000 on stream. Just it it should have a ample printouts to see exactly what it's doing. Me and
01:10:23.040 everybody else need to see exactly what it's doing. We just got to make sure that it's not printing out any um env
01:10:28.239 keys. Okay, this was a rabbit hole AI conversation. Sounds like you're going
01:10:33.520 down a fun rabbit hole and a good one, dude. So, I just love this game because
01:10:38.640 we can all attack it in whichever way is most interesting and the most interesting way to you is going to keep
01:10:45.920 you attacking it the longest and the hardest. So, I think that's
01:10:52.960 that's the key. Get in where you fit in. Just keep going.
01:11:12.000 Okay, let's go ahead and see here. Safe, no API keys. Perfect. The B is
01:11:17.920 excellent visibility. U banner and config. Um, okay, great.
01:11:24.480 Sounds like some liquidations are coming through here.
01:11:33.920 I do have 20 in there that I can trade.
01:11:49.440 Looks like Aster is going crazy, too. People are waking up. Not even done with
01:11:54.880 my analysis yet. But it did just go crazy. Not crazy, but
01:12:01.520 alltime high at
01:12:13.360 Oh, you can transfer it, dude. I missed it.
01:12:20.080 Enter the EVN address to transfer it to. I didn't miss it, actually. Let's see.
01:12:26.320 Let's see if I can still get it here because it's still an R6
01:12:31.679 first. 54. What's up, Nick?
01:12:45.199 Damn, I should have looked at that deeper. That was a good arbitrage. Still there.
01:12:51.360 Still there, but it's just smaller now.
01:13:45.520 Okay. Um, I'm in there actually. See if I can complete this R
01:13:51.760 assets deposit
01:13:57.679 complete identification to comply with industry. You need to uh verify before
01:14:03.600 you can use this service. ID photos and face recognition.
01:14:12.719 Okay, that's the problem. Dang, I don't have access to Bing X.
01:14:22.080 I thought they said I could do it without verification. Unfortunately, doesn't look like I can't.
01:14:52.480 How's it?
01:15:05.040 That's okay. Okay. Well, if you got access to BingX, go. Please arb that. It's 10
01:15:11.040 cents, 11 cents, 9 cents. Just depends. Please ar that.
01:15:20.239 Bing X is the only place with it.
01:15:27.120 Sad sad sad day. Sad sad day.
01:15:38.400 Okay, let's go ahead and see if this bot can run here. Let's go to Aster MMO2 and let's just go
01:15:47.840 run it here. Okay,
01:15:52.960 market analysis. Market neutral. Wait for better setup.
01:15:59.040 Average imbalance here. Not in position. Looking for entries.
01:16:04.480 Neutral. Beautiful.
01:16:10.159 Okay. So, I want to go ahead and
01:16:16.080 adjust some of these imbalances here so we can
01:16:24.800 change this up and get a order to go through.
01:16:46.159 Uh, what variables can I change on my MMO2 aster in order to make a trade go
01:16:53.600 through? Essentially, I need to beta test this.
01:16:59.840 Can I get on Bing? Does anybody have access to Bing X?
01:17:07.920 If you do, there's a huge arbitrage sitting there waiting for you.
01:17:37.040 Let's look through here.
01:17:45.360 Here
01:17:53.040 are a quick way to adjust the quick trade variables.
01:18:00.239 Symbol equals BTCUSDT. Okay. Average five positions five.
01:18:09.600 I saw some cool things grammatical evolution, but I didn't decide to continue with it.
01:18:15.520 These trigger entries liquidation look back minutes shorten to 1 to two. Okay.
01:18:25.120 To force a trade quickly lower the liquidation threshold.
01:18:30.880 Okay, let's do that. Actually, that's easy. Liquidation look back amount is
01:18:36.080 10. So, okay, we already got that. Adjust market analysis bias.
01:18:45.120 So this should eventually try to put an order in
01:18:52.000 red market short the market. It says imbalance. Okay. So it's getting liquidations
01:18:59.679 fetching order book. Okay. Setting leverage. Okay. Cool. Cool. Cool. So we
01:19:05.920 did try to put an order in and it was on BTCUSDT.
01:19:11.199 So great. So, let's go ahead here and say,
01:19:19.199 uh, looks like we got a little bit of an error. Uh, it did try to trigger an order here, but we got this error. Thank you. Please fix it. Thanks. And I'm very
01:19:25.840 interested in this valuation now that the price is skyrocketing.
01:19:33.120 I want to see if it's a good price or not.
01:19:48.640 Got it. Thanks for the certified polls. I rebuilt the comp using your 24-hour volume and OI for both venues and
01:19:54.880 freshes FDV market cap from token trackers. Download the updated chart.
01:20:00.480 You'll see three tables rendered. Okay. Snapshot FTV key multiples current versus fair FTV
01:20:07.920 scenarios sources used today hyperlquid protocol page aster protocol page the
01:20:13.920 numbers you gave me used as the ground truth for f low and oi
01:20:22.080 aster oi is 263 m 24hour volume is 1.07
01:20:28.239 07. Is that true though? Is that what it really said?
01:20:34.159 Is that what I said, dude? Feel like that's a little high.
01:20:42.320 Feel like that's a little uh
01:20:49.520 13 billion. No, it's not. You're high.
01:20:56.719 You're high.
01:21:02.560 valuation for hyperlquid numbers only. So hyperlquid FDV is a 58B. Uh for FTV market cap is 15.7
01:21:11.199 aster FTV is 4.47 47 mark cap 92
01:21:19.760 operating multiples here today using your flow and oi 24-hour vv
01:21:28.000 is23 versus astro.24
01:21:34.000 oi fdv hl.259 259 verse Aster 059.
01:21:44.480 What a FDV would be at HL par
01:21:49.679 24-hour volume par would be 4.53B
01:21:56.400 as already trades around HL's 24-hour volume
01:22:01.920 flow multiple 30-day volume parody
01:22:09.040 2.69B 69B.
01:22:15.199 ASER's 38 throughput is lighter relative to its FDV than HL's.
01:22:28.320 HL 30 days is 335B verse AERS 15B. OI parody 1 1B is negative 77% versus
01:22:37.679 current. to justify today's FDV on HL's OI
01:22:42.719 multiple AERS OI would need to be 1.16B
01:22:48.639 equivalent required activity at ASR's current FDV
01:22:54.159 24-hour volume would need to be 1B aster is 1.1%
01:22:59.520 over this 30-day volume 26B
01:23:06.800 1.66 66 current gap to close. All I needed is 1.16
01:23:13.840 4.37 [Music] on flash flow 24 hours a looks fairly
01:23:21.760 priced to HL right now in line on sustained throughput 30-day and
01:23:28.080 especially liquidity sickness oi aster screams scream screams rich screams
01:23:34.320 maybe screams rich verse hl oi skills and 30-day float O compounds
01:23:40.800 the premium gets earned if not the HL parody anchors point to 2.7B
01:23:47.040 30-day and 1.0 1B for OI as more conservative fairness
01:23:55.679 a simple aster fair value fully fair fully diluted value band based on as on
01:24:02.080 HL so top end momentum is 4.53B it's 24-hour parody
01:24:08.159 mid would be 2.69 69 B 30-day parody and low stickiness is 1.02.
01:24:18.800 If you want one number for riskaware sizing, a conservative blend of 40% OI,
01:24:24.960 40% 30-day, and 20% 24-hour lands near 2.39B.
01:24:31.760 That blend puts more weight on what's hardest to juice shortterm.
01:24:38.480 Hm. So what's your final analysis if you had to price Aster verse HL clearly and
01:24:47.120 concisely?
01:27:07.679 So this is the final pricing analysis here.
01:27:20.320 Let's go ahead and try to run this bot here as I think it's almost done. We just got to work through some of the
01:27:25.920 orders and stuff. So, it says long
01:27:38.080 says long.
01:27:45.920 Okay. So short licks waiting for liquidations to
01:27:52.000 exceed $10. Okay. So h how can we fix that?
01:28:03.440 Can you take everything that's in MMO 2
01:28:08.800 after the part of analyzing things and just try to
01:28:14.400 make a $10 order and then work on uh and then also after it makes that order,
01:28:21.280 checks the position, uses the functionality to check the position and then it tries to close that order and
01:28:27.040 put like 20 second time. in between with really good printouts. So, we can see
01:28:35.199 how um these core functionalities of the MM O2
01:28:41.280 aster works. The problem right now is I I'm kind of just waiting for the
01:28:47.520 uh signals to go off and it's taking a little bit of time to test this. So maybe you can make an MMO 2 test file.
01:29:01.840 Okay, that would be helpful just to speed it up a bit. Thanks for using Mundov Turn up.
01:29:51.600 My price for Aster is 2.4 to 2.7 billion valuation.
01:29:59.760 Why numbers only? Okay, 2.4 to 2.7 billion FDV and the price right now is
01:30:06.880 more than that. So, I think the kicker here is CZ.
01:30:13.280 That's it. You know, okay. Because if you look at the price now, let's go to Coin Market
01:30:19.760 Cap because it looks to have it better. It's at 4.4 billion. So, am I blasting this? I'm not.
01:30:27.840 But this is the huge kicker that's probably going to kick me in the face.
01:30:34.239 current current FDV
01:30:40.239 of Aster
01:30:47.600 based on my uh based on
01:30:54.239 model built with GBT and the real um OI
01:31:01.199 and volume numbers
01:31:08.800 we came to
01:31:14.960 2.4 to 2.7B 2.4 4 to 2.7B
01:31:22.560 valuation. But there's a huge butt. But but but
01:31:32.000 that could be 10x
01:31:38.320 with um CZ's
01:31:43.600 ego drive, whatever you want to call it,
01:31:48.800 to kill to to beat HL.
01:31:56.239 So in that case it would be 24B. But they would really need to they would
01:32:03.040 really need to increase the
01:32:08.719 OI and volume.
01:32:13.760 Okay. Now I've been doing an analysis on what
01:32:19.360 the true valuation is of the Aster exchange. I want you to build a file that I can run um and it will run every
01:32:28.159 hour and it will essentially build a really nice table of the 24-hour volume
01:32:38.000 and open interest.
01:32:44.960 We'll run it every four hours. Every four. Uh every x hours we'll start
01:32:51.040 at four. put as a variable at the top. It will make a really nice open interest
01:32:56.080 total volume table. Use some nice charting with some
01:33:01.679 colors and stuff and it will it'll plot it over time. So like we'll
01:33:08.400 have a different row for open interest volume for hyperlquid and aster.
01:33:16.960 And my vision here is, you know, in 7 days
01:33:22.480 from now, I'll be able to see the growth of both of them or the decline of both of them. Now, one may decline, one may
01:33:30.080 grow. I don't know. Not here to choose all that. I think it's very necessary to
01:33:36.480 watch these numbers because in combination with CZ and his backing and
01:33:41.679 yada yada whatever if the growth continues
01:33:48.000 then I want to be able to see how much is growing. So I want to see the open interest, the volume every time it runs
01:33:56.719 for both exchanges and the percent change from
01:34:03.360 from the start and the start will be when I run it the first time. So it
01:34:08.560 should show the date as well, of course. Today, September 18th. All right, go ahead and build that dashboard out for
01:34:14.320 me. This will be a new file called OI volume dashboard comparison or something.
01:34:21.040 Yeah, that's slick, bro. This is good. This is good. This is good.
01:37:18.719 All right, dude. This is great. Let's see how it does.
01:37:25.000 No text
01:37:25.360 So, that looks ugly, but we'll see how it does. one open I oi volume dashboard.
01:37:34.880 Okay. Copy path.
01:37:41.280 Let's go here and say Python.
01:37:49.119 No, that's not going to work though. Honda activate tflow python
01:38:00.800 one one or two dude no more. Don't do that to me.
01:38:07.199 I'll test it for now. I guess that's why they did it.
01:38:19.760 I guess that's why they did it, huh?
01:38:50.560 All right. So, it's gained the open interest for Aster right now. And then I'm just going to give it some feedback
01:38:56.080 essentially because I know it's going to be a little ugly
01:39:02.159 or something.
01:40:33.360 Okay, here we go. So, as oi
01:40:39.440 Okay, cool. 266 m.
01:40:47.040 Okay, this is beautiful. Actually, it's exactly what I wanted.
01:40:53.040 I have no I have no input here
01:41:05.360 zero input. Um, is Aster on Hyperlid?
01:41:20.639 That would be funny. They should put it
01:41:50.880 I don't know, dude. This is um interesting. So, why numbers only 24-hour parody?
01:41:58.560 Match HL's 24-hour volume to FTV. Okay. Says momentum is fine, but it's a thin
01:42:04.639 dayto-day signal. 30-day flow parody. Match HL's 30-day
01:42:10.800 volume to FTV is 2.69. 69B. Okay,
01:42:20.400 better read on sustained activity. Aster is light here today. Liquidity, stickiness, parody, the toughest anchor.
01:42:29.040 Aster's OI is far below HL on valuation
01:42:35.199 adjusted basis. So what's the fair? What's fair today? I
01:42:41.920 downweed the noisy 24-hour metric and lean on more persistent OI and 30-day
01:42:47.840 interest. Okay. Conservative blend lands near 2.4 billion. That's my mark. I'd
01:42:54.719 accept. So, what if you lean in? What if you lean into the 24hour
01:43:00.960 volume and open interest? Because it's only been around for like a day, so
01:43:07.119 these things can change quickly.
01:43:15.760 What would your new valuation be? I just want to double check because this is kind of mooning, bro.
01:43:23.040 It's kind of mooning. The start of today it was here.
01:43:28.960 It's up 34%.
01:43:36.239 Okay, sick. And while she's doing that, I'm going to go test this bot out.
01:43:47.840 So, let's go ahead to the test here. And this should allow us to buy, sell,
01:43:54.159 buy, check position, and sell. Just a quicker way to test this.
01:44:00.159 Starting in 5 seconds. Okay. Position size 10. Delay between. Okay. Current
01:44:05.360 ask or bid. Okay. Canceling orders. Perfect. Bad request.
01:44:12.239 Beautiful.
01:44:29.199 There is margin is insufficient. You need to have USDT in your futures. Dr.
01:44:42.880 H petrols
01:44:51.280 says I have. So
01:45:11.119 It says I have equity in my account.
01:45:18.880 It says I have equity in my account.
01:45:37.119 Let's close some of these. They did not list it. Somebody was just trolling yesterday. Sky lineia hype bird. Okay.
01:46:11.040 That's a big arbitrage. Still big, dude.
01:46:19.040 Still 10 cents.
01:46:25.600 Perfect. I updated test file checks balance. Okay. Yeah, show our balance. Good job.
01:46:37.679 1919. Perfect. [Music] margin is insufficient.
01:46:48.639 Let's use a different symbol.
01:46:58.080 Let's try soul instead. Maybe that will help because it's smaller size.
01:49:08.320 Okay, so let's see here. Perfect. I've updated the testbot to use Soul USDT instead of BTCUSD
01:49:13.840 T. Here's why this should work better. Why soul is better for testing? BTC price too high. Soul price smaller.
01:49:20.960 Okay, I mean that shouldn't be the problem, but we'll see. Yeah, maybe with 5x
01:49:26.560 leverage. Yeah, 2x leverage here.
01:49:34.239 Order placed. Yeah, I'm in there.
01:49:40.560 I made an order already. So, looks like this bot is pretty much done.
01:49:46.000 It works. Cross margin mark price.
01:49:54.719 No position found. Okay,
01:50:00.159 looks like we got the order in, which is awesome. Looks like we got the order in. We just
01:50:05.520 need to fix this position part getting the position. So, let's work on that.
01:50:15.840 I do want to look into this while I'm doing that. Um, let's go here to
01:50:24.159 Okay, here's the 1 day 24-hour volume. No 30-day 24-hour volume parody. Fair is 4.53,
01:50:33.040 but the fair on OI is 1B. We waited those is 3.5. Why that band?
01:50:40.080 You're already at 24-hour parody. Oi is a drag, but that will build.
01:50:47.040 Okay. So 4.53B is the like optimistic
01:50:52.159 and what is it now? It's about that
01:50:59.119 4.7. Okay. So let's go back to there and say
01:51:07.920 4.5B optimistic off extrapulating. Is that how you say
01:51:13.840 it? strap you later the 24hour
01:51:19.119 volume. Okay, that's where I'm at on this. So, I
01:51:25.920 think it's a fair value right now. The kicker is just a CZ. That's it.
01:51:32.639 I'll keep I'll keep looking at it. See how it grows because I have this dashboard now that will run every four
01:51:39.440 hours and get the open interest.
01:51:45.440 Okay, I actually like that sound though because it tells me when it's done.
01:51:51.520 Placing buy order. I should probably get out of the other position then, huh? Say market close.
01:51:58.400 Run it back.
01:52:05.040 Are we live still?
01:52:11.280 Yeah, it looks like it. Order place. Perfect.
01:52:18.560 It's in open orders now. It's waiting 20 seconds.
01:52:38.719 Okay. So, [Music]
01:52:49.199 let's have it loop and cancel the order and replace the order if it's not filled already. So, and then don't have it stop
01:52:54.480 until we get this test complete. I need to see if the it gra grabs the position correctly. And it should show us the
01:53:00.080 position at zero or you know if we don't have a position but
01:53:45.119 Now let's update the main test flow to not give up and keep trying until complete.
01:54:19.760 compacting conversation. Nice, dude. Great timing.
01:54:26.800 Let's go to spot here. I'm up $8 today. I buy.
01:54:39.920 That's cool. I bought that because I thought I was going to be able to do the arbitrage,
01:54:45.840 but then I wasn't able to because I didn't have access to whatever it's called, ThingX.
01:54:51.760 Um,
01:54:58.800 he kind of got a bet on CZ, but I don't know. I think it might be
01:55:05.199 still. You saw the valuation method to it.
01:55:30.080 Contacting conversation. Let's go back to the per here. Let's cancel this order.
01:55:37.679 And if I get all of this correct, then the bot will be working. And I can just show you that
01:56:09.599 Perfect. The MMO2 test file already has the persistent re-entry. Okay,
01:56:16.560 let's go ahead and run it back. We should see an order pop up here. It's
01:56:21.760 right side.
01:56:28.800 What are you building now? Seems like a new project each day.
01:56:36.159 Another day, another dollar though. Another day, another dollar.
01:56:41.599 No order not filled. Canceling and retrying with better price. Waiting for order to fill. Okay, it's filled.
01:56:49.679 Another day dollar. Binance just released a new exchange. Let's build a bot for it.
01:56:58.800 Okay, so it's in there. Size is 0.1. PNL is 04. Waiting 10 seconds to verify.
01:57:05.280 Perfect. Perfect. Checking position status. Okay, I'm at a loss of 07.
01:57:13.280 Position value is $24.
01:57:19.599 I mean, is it though?
01:57:28.880 Yeah, it is because I'm using 2x. Kill switch closed. Let's see if we
01:57:34.159 close it. Okay. Sick, dude. This works.
01:57:39.199 This works. This works. This works. Test completed. Nice, dude.
01:57:58.080 amazing job. The test fully works now.
01:58:04.719 Go ahead and use those learnings to implement into the main MM O2
01:58:09.760 and then I could call that complete.
01:58:31.840 Aster funks. Aster API.
01:58:46.639 That's our funks.
01:58:54.080 Aser Funks ASER API, please go ahead and build into the
01:59:00.719 readme the exact files needed in order to run this bot.
01:59:06.480 So, I know we need the MM O2 aster. I think we need the Aster function. I think we need the Aster API and maybe
01:59:13.119 the API.py, but there might be something I'm missing here. So, just make a short but concise way to um let me know
01:59:21.599 exactly what we need for this uh building for this exchange because I
01:59:27.760 will show this off here later.
01:59:39.679 Okay, perfect. Dr. Update. I have successfully updated the main MMO2 bot MMO2 aster with all the key learnings.
01:59:46.800 Perfect. Order retry. Perfect. Balance checking. Okay.
01:59:52.800 Okay. So, and then also also change the
02:00:01.840 MMO2 main one to be soul instead of BTC.
02:01:03.360 Perfect. Dr. Dog, I've completed both tasks. Updated MMO2 mainbot. Change from
02:01:09.040 PTC to USDT. Create the read me. Okay. So, the MMO2 mainbot API wrapper helper
02:01:14.239 functions. Okay. And the API.py.
02:01:20.560 Sweet, dude. So, let's go look at that read me here.
02:01:26.880 AP.Y. py aster py aster api py beautiful
02:01:33.760 to run the mmo2 tube on aster exchange you need these four core files
02:01:40.960 okay sick
02:01:47.679 is amazing we did that in two hours
02:01:52.800 that's crazy how fast we did that bro That's insane.
02:02:00.239 Insane. I showed you everything.
02:02:05.920 So, let's go ahead here and
02:02:12.080 yeah, you have access to everything. Let me go ahead and scroll through the code real quick because you can re rewind this easily.
