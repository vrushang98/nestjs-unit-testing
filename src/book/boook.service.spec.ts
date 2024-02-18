import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import mongoose, { Model } from 'mongoose';
import { BookService } from './book.service';
import { Book } from './schemas/book.schema';

describe('BookService', () => {
  let bookService: BookService;
  let model: Model<Book>;

  const mockBook = {
    _id: '63463406286196cf0ed335f4',
    title: 'New Book',
  };

  const mockBookService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    model = module.get<Model<Book>>(getModelToken(Book.name));
  });

  describe('findById', () => {
    it('should find and return a book by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockBook);

      const result = await bookService.findById(mockBook._id);

      expect(model.findById).toHaveBeenCalledWith(mockBook._id);
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      const id = '507f191e810c19729de860ea';

      /**
       * When you use jest.spyOn() to mock a method, it temporarily replaces the original method with a mocked version for the duration of the test.
       * This allows you to control its behavior during the test.
       *
       * So here instead of actual method of mongoose.isValidObjectId, below mocked version will be called and it will return false
       */
      const isValidObjectIDMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(bookService.findById(id)).rejects.toThrow(
        BadRequestException,
      );

      /**
       * The line expect(isValidObjectIDMock).toHaveBeenCalledWith(id); is an assertion in your test case.
       * It verifies that the isValidObjectId function was called with the specified id parameter during the execution of your test.
       */
      expect(isValidObjectIDMock).toHaveBeenCalledWith(id);

      /**
       * However, after the test completes, it's generally a good practice to restore the original method to ensure that subsequent tests or parts of your application that rely on the original behavior aren't affected.
       * So, isValidObjectIDMock.mockRestore() restores the original isValidObjectId method back to its original implementation after the test has run.
       */
      isValidObjectIDMock.mockRestore();
    });

    it('should throw NotFoundException if book not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(bookService.findById(mockBook._id)).rejects.toThrow(
        NotFoundException,
      );

      expect(model.findById).toHaveBeenCalledWith(mockBook._id);
    });
  });
});