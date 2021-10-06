import { Meteor } from 'meteor/meteor'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'

export const Tasks = new Mongo.Collection('tasks')

if (Meteor.isServer) {
    //THIS ONLY RUNS ON THE SERVER
    //ONLY PUBLISH TASKS THAT ARE PUBLIC OR BELONG TO THE CURRENT USER
    Meteor.publish('tasks', function tasksPublication() {
        return Tasks.find({
            $or: [
                { private: { $ne: true } },
                { owner: this.userId },
            ],
        })
    })
}


Meteor.methods({
    'tasks.insert'(text) {
        check(text, String)

        //MAKE SURE USER IS LOGGED IN BEFORE INSERTING A TASK
        if (!this.userId) {
            throw new Meteor.Error('not-authorized')
        }
        Tasks.insert({
            text,
            createdAt: new Date(),
            owner: this.userId,
            username: Meteor.users.findOne(this.userId).username,
        })
    },

    'tasks.remove'(taskId) {
        check(taskId, String)

        const task = Tasks.findOne(taskId)
        if (task.private && task.owner !== this.userId) {
            //IF THE TASK IS PRIVATE, MAKE SURE ONLY OWNER CAN DELETE IT
            throw new Meteor.Error('not-authorized')
        }

        Tasks.remove(taskId)
    },

    'tasks.setChecked'(taskId, setChecked) {
        check(taskId, String)
        check(setChecked, Boolean)

        const task = Tasks.findOne(taskId)
        if (task.private && task.owner !== this.userId) {
            //IF TASK IS PRIVATE, MAKE SURE ONLY OWNER CAN CHECK IT OFF
            throw new Meteor.Error('not-authorized')
        }

        Tasks.update(taskId, { $set: { checked: setChecked } })
    },

    'tasks.setPrivate'(taskId, setToPrivate) {
        check(taskId, String)
        check(setToPrivate, Boolean)

        const task = Tasks.findOne(taskId)

        //MAKE SURE ONLY THE TASK OWNER CAN MAKE TASK PRIVATE
        if (task.owner !== this.userId) {
            throw new Meteor.Error('not-authorized')
        }
        Tasks.update(taskId, { $set: { private: setToPrivate } })
    }
})