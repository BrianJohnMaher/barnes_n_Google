const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id });
      }
      throw AuthenticationError;
    },
  },
  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      try {
        const user = await User.findOne({ email });

        if (!user) {
          throw AuthenticationError;
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
          throw AuthenticationError;
        }

        const token = signToken(user);

        return { token, user };
      } catch (err) {
        console.log(err);
        throw new Error("Internal server error");
      }
    },
    saveBook: async (_, { bookInput }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        );

        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error("Internal server error");
      }
    },
    removeBook: async (_, { bookId }, { user }) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error("Couldn't find user with this id!");
        }

        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error("Internal server error");
      }
    },
  }

};

module.exports = resolvers;