/* eslint-env mocha */

import { Meteor } from 'meteor/meteor'
import { Random } from 'meteor/random'
import { assert } from 'chai'

import { Tasks } from './tasks'



if (Meteor.isServer) {
    describe('Tasks', () => {
        describe('methods', () => {
            const userId = Random.id()
            let taskId

            beforeEach(() => {
                Tasks.remove({})
                taskId = Tasks.insert({
                    text: 'test task',
                    createdAt: new Date(),
                    owner: userId,
                    username: 'tmeasday',
                })
            })

            it('can delete owned task', () => {
                //FIND INTERNAL IMPLEMENTATION OF THE TASK METHOD SO WE CAN TEST IT IN ISOLATION
                const deleteTask = Meteor.server.method_handlers['tasks.remove']

                //SET UP FAKE METHOD INVOCATION THAT LOOKS LIKE WHAT THE METHOD EXPECTS
                const invocation = { userId }

                //RUN THE METHOD WITH 'THIS' SET TO FAKE INVOCATION
                deleteTask.apply(invocation, [taskId])

                //VERIFY THAT THE METHOD DOES WHAT EXPECTED
                assert.equal(Tasks.find({}).count(), 0)
            })
        })

    })
}