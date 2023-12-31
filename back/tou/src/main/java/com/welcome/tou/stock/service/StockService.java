package com.welcome.tou.stock.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.welcome.tou.common.exception.FailTransactionExcepction;
import com.welcome.tou.common.exception.InvalidStockException;
import com.welcome.tou.common.exception.MismatchException;
import com.welcome.tou.common.exception.NotFoundException;
import com.welcome.tou.consumer.dto.FabricAssetDto;
import com.welcome.tou.statement.dto.request.StockUpdateInBlockRequestDto;
import com.welcome.tou.stock.domain.*;
import com.welcome.tou.stock.dto.request.StockCreateByOfficialsRequestDto;
import com.welcome.tou.stock.dto.request.StockCreateInBlockRequestDto;
import com.welcome.tou.stock.dto.response.*;
import lombok.extern.java.Log;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import com.welcome.tou.client.domain.Branch;
import com.welcome.tou.client.domain.BranchRepository;
import com.welcome.tou.client.domain.Worker;
import com.welcome.tou.client.domain.WorkerRepository;
import com.welcome.tou.common.utils.ResultTemplate;
import com.welcome.tou.stock.dto.request.ProductCreateRequestDto;
import com.welcome.tou.stock.dto.request.StockCreateByProducerRequestDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {
    private final ProductRepository productRepository;
    private final WorkerRepository workerRepository;
    private final BranchRepository branchRepository;
    private final StockRepository stockRepository;
    private final AverageRepository averageRepository;


    public ResultTemplate getAllStockList(UserDetails worker) {
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch myBranch = reqWorker.getBranch();

        List<Stock> list = stockRepository.findByBranchUnused(myBranch.getBranchSeq());

        StockListResponseDto responseDto = StockListResponseDto.from(list.stream().map(stock -> {
            String status = "";
            if(stock.getInOutStatus() == Stock.InOutStatus.IN) status = "입고";
            else if(stock.getInOutStatus() == Stock.InOutStatus.OUT) status = "출고";
            return StockResponseDto.from(stock, status);
        }).collect(Collectors.toList()));

        return ResultTemplate.builder().status(200).data(responseDto).build();
    }


    public ResultTemplate getStockList(UserDetails worker) {
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch myBranch = reqWorker.getBranch();

        List<Stock> list = stockRepository.findStockByBranchAndInOutStatusAndUseStatus(myBranch.getBranchSeq(), Stock.InOutStatus.IN, Stock.UseStatus.UNUSED);

        StockListResponseDto response = StockListResponseDto.from(list.stream().map(stock -> {
            return StockResponseDto.from(stock, "입고");
        }).collect(Collectors.toList()));

        return ResultTemplate.builder().status(HttpStatus.OK.value()).data(response).build();
    }

    public ResultTemplate getStockListForStatement(UserDetails worker) {
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch myBranch = reqWorker.getBranch();

        List<Stock> stockList = stockRepository.findStockByBranchAndInOutStatusAndUseStatus(myBranch.getBranchSeq(), Stock.InOutStatus.OUT, Stock.UseStatus.UNUSED);

        if(stockList == null || stockList.size() == 0) {
            throw new NotFoundException("거래 가능한 재고가 존재하지 않습니다.");
        }

        StockListResponseDto responseDto = StockListResponseDto.from(stockList.stream().map(stock -> {
            return StockResponseDto.from(stock, "출고");
        }).collect(Collectors.toList()));

        return ResultTemplate.builder().status(200).data(responseDto).build();
    }

    public ResultTemplate getProductList(UserDetails worker) {
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch myBranch = reqWorker.getBranch();

        List<Product> list = productRepository.findByBranch(myBranch.getBranchSeq());

        ProductListResponseDto response = ProductListResponseDto.builder().productList(list.stream().map(product -> {
            return ProductResponseDto.builder().productSeq(product.getProductSeq()).productName(product.getProductName()).build();
        }).collect(Collectors.toList())).build();

        return ResultTemplate.builder().status(HttpStatus.OK.value()).data(response).build();
    }

    public ResultTemplate getDashStockList(Long branchSeq) {
        Branch branch = branchRepository.findById(branchSeq).orElseThrow(()->{
            throw new NotFoundException(NotFoundException.BRANCH_NOT_FOUND);
        });

        List<Stock> list = stockRepository.findByBranchLimit5(branchSeq);

        DashStockListResponseDto response = DashStockListResponseDto.builder().stockList(
                list.stream().map(stock -> {
                    return DashStockResponseDto.from(stock);
                }).collect(Collectors.toList())).build();

        return ResultTemplate.builder().status(HttpStatus.OK.value()).data(response).build();
    }

    public ResultTemplate getStockPriceGraphList(Long branchSeq) {

        Branch branch = branchRepository.findById(branchSeq).orElseThrow(()->{
            throw new NotFoundException(NotFoundException.BRANCH_NOT_FOUND);
        });

        List<Average> list = averageRepository.findRecentSixMonthsByBranch(branchSeq, LocalDateTime.now().minusMonths(7));
        List<AveragePriceListResponseDto> productList = list.stream()
                .collect(Collectors.groupingBy(Average::getAverageProductName)) // productName으로 그룹화
                .entrySet().stream().map(entry -> {
                    String productName = entry.getKey();
                    List<AveragePriceResponseDto> priceList = entry.getValue().stream().map(average ->
                            AveragePriceResponseDto.builder()
                                    .stockDate(average.getAverageDate().getMonthValue() + "월")
                                    .stockPrice(average.getAverageProductPrice())
                                    .build()
                    ).collect(Collectors.toList());
                    return AveragePriceListResponseDto.builder()
                            .stockName(productName)
                            .averagePriceList(priceList)
                            .build();
                }).collect(Collectors.toList());

        AveragePriceGraphListResponseDto response = AveragePriceGraphListResponseDto.builder().productList(productList).build();
        return ResultTemplate.builder().status(HttpStatus.OK.value()).data(response).build();

    }


    @Transactional
    public ResultTemplate<?> addProduct(ProductCreateRequestDto request, UserDetails worker) {
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch branch = branchRepository.findById(request.getBranchSeq())
                .orElseThrow(() -> new NotFoundException(NotFoundException.BRANCH_NOT_FOUND));

        Product newProduct = Product.createProduct(branch, request.getProductName(), request.getProductWeight());
        productRepository.save(newProduct);

        return ResultTemplate.builder().status(200).data("상품 추가 완료").build();
    }

    @Transactional
    public ResultTemplate<?> addStockByProducer(StockCreateByProducerRequestDto request, UserDetails worker) {
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch branch = reqWorker.getBranch();

        System.out.println(request.getStockName());
        System.out.println(request.getStockPrice());
        System.out.println(request.getStockQuantity());

        if(branch.getCompany() != reqWorker.getCompany()) {
            throw new MismatchException(MismatchException.WORKER_AND_BRANCH_MISMATCH);
        }

        Stock newStock = Stock.createStock(
                branch,
                branch,
                request.getStockName(),
                branch.getChannelCode(),
                request.getStockQuantity(),
                request.getStockUnit(),
                LocalDateTime.now(),
                request.getStockPrice(),
                Stock.InOutStatus.OUT,
                Stock.UseStatus.UNUSED);

        stockRepository.save(newStock);

        // 블록체인 서버 요청
        RestTemplate restTemplate = new RestTemplate();
        StockCreateInBlockRequestDto bcRequest = StockCreateInBlockRequestDto.builder()
                .assetId(String.valueOf(newStock.getStockSeq()))
                .previousAssetId("0")
                .statementSeq(0L)
                .branchSeq(branch.getBranchSeq())
                .branchLocation(branch.getBranchLocation())
                .branchName(branch.getBranchName())
                .branchContact(branch.getBranchContact())
                .stockName(newStock.getStockName())
                .stockQuantity(newStock.getStockQuantity().longValue())
                .stockUnit(newStock.getStockUnit())
                .stockDate(newStock.getStockDate().toString())
                .inoutStatus(newStock.getInOutStatus().name())
                .useStatus(newStock.getUseStatus().name())
                .latitude(branch.getLatitude().doubleValue())
                .longitude(branch.getLongitude().doubleValue())
                .build();

        ResponseEntity<ResultTemplate> response = restTemplate.postForEntity(
                "http://k9b310a.p.ssafy.io:8080/api/ledger/asset",
                bcRequest,
                ResultTemplate.class
        );

        if(response.getBody().getStatus() != 200){
            throw new FailTransactionExcepction(FailTransactionExcepction.CREATE_TRANSACTION_FAIL);
        }

        System.out.println("Response from POST request: " + response.getBody());

        return ResultTemplate.builder().status(200).data("재고 추가 완료").build();
    }

    @Transactional
    public ResultTemplate<?> addStockByOfiicials(StockCreateByOfficialsRequestDto request, UserDetails worker){
        Long workerSeq = Long.parseLong(worker.getUsername());
        Worker reqWorker = workerRepository.findById(workerSeq)
                .orElseThrow(() -> new NotFoundException(NotFoundException.WORKER_NOT_FOUND));

        Branch branch = reqWorker.getBranch();

        if(branch.getCompany() != reqWorker.getCompany()) {
            throw new MismatchException(MismatchException.WORKER_AND_BRANCH_MISMATCH);
        }

        Stock beforeStock = stockRepository.findById(request.getBeforeStockSeq())
                .orElseThrow(() -> new NotFoundException(NotFoundException.STOCK_NOT_FOUND));

        if(branch != beforeStock.getBranch()){
            throw new MismatchException(MismatchException.STOCK_IS_NOT_IN_BRANCH);
        }
        if(beforeStock.getUseStatus() == Stock.UseStatus.USED) {
            throw new InvalidStockException(InvalidStockException.STOCK_USED_ALREADY);
        }
        if(beforeStock.getInOutStatus() == Stock.InOutStatus.OUT) {
            throw new InvalidStockException(InvalidStockException.STOCK_IS_NOT_NEED_PROCESS);
        }

        beforeStock.updateUseStatus(Stock.UseStatus.USED);
        stockRepository.save(beforeStock);
        // 블록체인 asset 업데이트
        RestTemplate restTemplate = new RestTemplate();
        StockUpdateInBlockRequestDto bcUpdateRequest = StockUpdateInBlockRequestDto.builder()
                .assetId(String.valueOf(beforeStock.getStockSeq()))
                .build();

        HttpEntity<StockUpdateInBlockRequestDto> requestEntity = new HttpEntity<>(bcUpdateRequest);
        ResponseEntity<ResultTemplate> res = restTemplate.exchange(
                "http://k9b310a.p.ssafy.io:8080/api/ledger/asset",
                HttpMethod.PUT,
                requestEntity,
                ResultTemplate.class
        );

        if (res.getBody().getStatus() != 200) {
            throw new FailTransactionExcepction(FailTransactionExcepction.UPDATE_TRANSACTION_FAIL);
        }

        Stock newStock = Stock.createStock(beforeStock.getBranch(),
                beforeStock.getFromBranch(),
                request.getNewStockName(),
                beforeStock.getStockCode(),
                request.getNewStockQuantity(),
                request.getNewStockUnit(),
                LocalDateTime.now(),
                request.getNewStockPrice(),
                Stock.InOutStatus.OUT,
                Stock.UseStatus.UNUSED);

        stockRepository.save(newStock);

        // 이전 블록 조회
        ObjectMapper objectMapper = new ObjectMapper();
        String url = "http://k9b310a.p.ssafy.io:8080/api/ledger/asset/" + beforeStock.getStockSeq();

        ResponseEntity<ResultTemplate<String>> fabricRes = restTemplate.exchange(url, HttpMethod.GET, null, new ParameterizedTypeReference<ResultTemplate<String>>() {
        });

        if(fabricRes.getBody().getStatus() != 200) {
            throw new NotFoundException(NotFoundException.ASSET_ID_NOT_FOUND);
        }

        String data = fabricRes.getBody().getData();
        FabricAssetDto asset = null;

        try {
            asset = objectMapper.readValue(data, FabricAssetDto.class);
        } catch (JsonProcessingException e) {
            return ResultTemplate.builder().status(HttpStatus.BAD_REQUEST.value()).data("Json을 asset으로 변환하는데 실패했습니다.").build();
        }

        // 블록체인 asset 추가
        StockCreateInBlockRequestDto bcCreateRequest = StockCreateInBlockRequestDto.builder()
                .assetId(String.valueOf(newStock.getStockSeq()))
                .previousAssetId(String.valueOf(asset.getPreviousAssetId()))
                .statementSeq(0L)
                .branchSeq(branch.getBranchSeq())
                .branchLocation(branch.getBranchLocation())
                .branchName(branch.getBranchName())
                .branchContact(branch.getBranchContact())
                .stockName(newStock.getStockName())
                .stockQuantity(newStock.getStockQuantity().longValue())
                .stockUnit(newStock.getStockUnit())
                .stockDate(newStock.getStockDate().toString())
                .inoutStatus(newStock.getInOutStatus().name())
                .useStatus(newStock.getUseStatus().name())
                .latitude(branch.getLatitude().doubleValue())
                .longitude(branch.getLongitude().doubleValue())
                .build();

        ResponseEntity<ResultTemplate> response = restTemplate.postForEntity(
                "http://k9b310a.p.ssafy.io:8080/api/ledger/asset",
                bcCreateRequest,
                ResultTemplate.class
        );

        if(response.getBody().getStatus() != 200){
            throw new FailTransactionExcepction(FailTransactionExcepction.CREATE_TRANSACTION_FAIL);
        }

        return ResultTemplate.builder().status(200).data("공정 처리가 완료되었습니다.").build();
    }
}
