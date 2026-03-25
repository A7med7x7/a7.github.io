+++
date = '2026-03-21T00:00:00+03:00'
draft = false
title = 'On Entering Machine Learning Competitions'
description = "A map for people starting out in Kaggle and Zindi, After spending a year away from it, reflecting on what actually matters."
tags = ['generalist-notes', 'series', 'ai-and-tech', 'learning', 'growth']
category = 'learning'
+++

Almost everyone can build a machine learning model now. you can prompt your way into a working pipeline in a matter of five minutes. building a model is not the problem, optimizing it is, understanding how and what it is doing are two completely different things, and that gap becomes very visible the moment you step into a competition.

I spent time participating in competitions on [Kaggle](https://kaggle.com/) and [Zindi](https://zindi.africa/), joining teams, reading solutions, watching people work. and the pattern I kept seeing was the same: build a baseline, iterate, submit, repeat, and that's fine,  that's how it works, but without ever asking why the iteration was moving in a particular direction. not having a compass. is what mostly happen. the leaderboard becomes the only signal, and you start optimizing for a number without understanding what the number means. that's not learning. that's just another form of guessing.

I stepped away from competitions for over a year. I needed the distance to process what I'd actually absorbed. this is what I would tell someone walking through that door for the first time.


**Start with [exploration](http://a7med7x7.github.io/posts/exploration)**

It is completely fine to enter a competition before you know what gradient descent is. I mean that. join one or two, submit something, watch your name appear on a leaderboard at position 1300. that number doesn't matter, the feeling does. the act of participating, of being inside a real problem with a real community, [influences how you think about the field](http://a7med7x7.github.io/posts/action-influnces-thought) in ways that no course can replicate. machine learning is not just mathematics and curiosity. it is also people, discussions, shared frustration(I love this one), and the particular joy of discovering that something you built actually works.

Explore first. understand later. the motivation that comes from being in the arena is the thing that will carry you through the harder parts.

**Then build the map**
When you decide to take it more seriously, there are four concepts that will give you enough of a foundation to stop feeling lost. not to master everything, just to understand what you are actually doing when you build a model.

The bias-variance tradeoff, you will read about this in almost any machine learning book you pick up, and that is fine, because it is the most fundamental thing. every model you build is navigating between underfitting and overfitting. once you understand that tension, you stop making random decisions and play :).

Loss functions, your model is not learning magically. it is minimizing a mathematical function. once you know which one, and whether it actually matches what the competition is measuring, everything clicks. a mismatch here and your entire training process is pointing at the wrong direction.

Gradient descent and optimization, not just how it works, but why learning rate, batch size, and number of epochs are not arbitrary / random. they shape how your model moves. once you feel this practically, you stop treating them like magic numbers.

Feature importance, this is where you learn to look at your data honestly and admit when it is garbage. not every input is signal. once you can separate the two, you will boost your result :).


In my opinion, that is enough to have the big picture. from there, everything else builds on a foundation you actually understand.

** Traps traps worth naming**

- read the problem statement. then read it again.
- search past competitions with similar structure, study the winning solutions, not just the scores.
- never paste code you don't understand. every blind spot you create, you will waste time over later. read your code.
- use the discussion boards. ask questions, share observations, be present in the community.
- medals are a byproduct. understanding is the goal.
- learn the different types of cross validation and know when to use which.
- understand how your models actually work, not just how to call them.
- do not chase the public leaderboard. it will lie to you. trust your CV.

---

**On finding a team**

There is no point collecting medals alone. find people to work with, not because it will improve your score, but because the learning accelerates when you are thinking out loud with someone who pushes back. share your wins. share your confusion. the journey is the thing, and the journey is more honest when it is shared.

**A distinction worth carrying with you**

When you compete on Kaggle or Zindi, you are working in something that resembles a research environment, experimentation, analysis, iteration toward a benchmark. but real world machine learning is different, and it is worth touching that reality at least once before you build too strong a picture of what the field looks like.

In production settings, a model that is slightly less accurate but significantly faster to run, easier to interpret, and cheaper to deploy is often the better model. ensemble methods that stack five models together for a 0.006 improvement on a leaderboard make no sense when you need something running in real time at scale. **generalization**, interpretability, and inference efficiency matter in ways that competition metrics rarely capture. some methods used in Kaggle and Zindi are destroying that part.

Deploy something. even once. build the pipeline from training to serving and watch what changes when the goal is no longer a leaderboard position but a working system. it will reshape how you think about every competition you enter after that.

This field is difficult and it is beautiful and it will confuse you constantly. that is not a sign you are doing it wrong. that is the nature of the territory. the goal is not to stop being confused, it is to become someone who knows how to move through confusion without freezing.

Start exploring. stay curious. question why things work, not just whether they do.