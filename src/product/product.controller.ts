import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Req, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBody, ApiHeader, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseProductDTO } from './dto/response-product.dto';
import { ErrorMessageDTO } from 'src/data-models/error-message.dto';
import { QueryProductDTO } from './dto/query-product.dto';




@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productsService: ProductService) {}

  @ApiOperation({description: 'Get all products in the system'})
  @ApiOkResponse({type: [ResponseProductDTO], description: 'All Product Objects' })
  @ApiQuery({ type: QueryProductDTO})
  @ApiQuery({name: 'offset', description: 'offset', required: false})
  @ApiQuery({name: 'limit', description: 'limit', required: false})
  @Get() 
  getAllProducts(@Query() offsetLimit): Promise<ResponseProductDTO[]| ErrorMessageDTO> {
    return this.productsService.getAllProducts(offsetLimit);
  }


  //---------------------------------------Without Query Parameters--------------------------------
  //   @ApiOperation({description: 'Get all products in the system'})
  // @ApiOkResponse({type: [ResponseProductDTO], description: 'All Product Objects' })
  // @ApiQuery({ type: QueryProductDTO})
  // @Get() 
  // getAllProducts(): Promise<[ResponseProductDTO]| ErrorMessageDTO> {
  //   return this.productsService.getAllProducts();
  // }
  //------------------------------------------------------------------------------------------------

  @ApiOperation({description: 'Get a particular product details'})
  @ApiParam({name: 'id', type: String, required: true, description: 'Id of the product' })
  @ApiOkResponse({type: ResponseProductDTO, description: 'Product Object' })
  @Get(':id')
  getProduct(@Param('id') id: string): Promise<ResponseProductDTO| ErrorMessageDTO> {
    return this.productsService.getProduct(id);
  }
  
  @ApiOperation({description: 'Create a new product'})
  @ApiBody({type: CreateProductDto, description: 'Product Object'})
  @ApiOkResponse({type: ResponseProductDTO, description: 'New Created Product Object'})
  @ApiHeader({ name:'token',description: 'Access token', required: true })
  @UseGuards(AuthGuard)
  @Post()
  createProduct(@Req() req , @Body() createProductDto: CreateProductDto) {
    return this.productsService.createProduct(req.user, createProductDto);
  }

  @ApiOperation({description: 'Update a product'})
  @ApiHeader({ name:'token',description: 'Access token', required: true })
  @UseGuards(AuthGuard)
  @Put(':id')
  updateProduct(@Req() req, @Param('id') id: string, @Body() updateProduct: UpdateProductDto) {
    return this.productsService.updateProduct(req.user, id, updateProduct);
  }

  @ApiOperation({description: 'Delete a product'})
  @ApiHeader({ name:'token',description: 'Access token', required: true })
  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteProduct(@Req() req , @Param('id') id: string ){
    return this.productsService.deleteProduct(req.user, id);
  }
}
