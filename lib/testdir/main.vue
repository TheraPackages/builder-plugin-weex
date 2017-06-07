<template>
  <div style="{backgroundColor: transparent, height: 276 }">
    <div class="item-container" @click="detailClick">
      <img class="item-pic" :src="pic" />
      <div class="item-info">
        <div>
          <text class="title">{{title}}</text>
          <text class="shop">{{shop}}</text>
        </div>
        <div class="bottom">
          <div class="buy-info">
            <text class="price">￥{{price}}</text>
            <text class="sold">销量{{sold}}笔</text>
          </div>
          <text class="buy" @click="buyClick">买</text>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  .item-container {
    width: 750;
    height: 276;
    padding-top: 24;
    padding-left: 30;
    padding-right: 30;
    padding-bottom: 24;
    background-color: #ffffff;
    flex-direction: row;
  }
  .item-pic {
    width: 216;
    height: 216;
  }
  .item-info {
    width: 454;
    height: 216;
    margin-left: 20;
    flex-direction: column;
    justify-content: space-between;
  }
  .title {
    font-size: 28;
    font-weight: bold;
    color: #333333;
  }
  .shop {
    font-size: 24;
    color: #999999;
    margin-top: 10;
  }
  .bottom {
    width: 454;
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
  }
  .buy-info {
    flex-direction: row;
    align-items: flex-end;
  }
  .price {
    color: #f40000;
    font-size: 28;
    font-weight: bold;
  }
  .sold {
    margin-left: 10;
    font-size: 28;
    color: #999999;
  }
  .buy {
    width: 80;
    height: 80;
    color: #ffffff;
    font-size: 40;
    background-color: #f40000;
    text-align: center;
    padding-top: 16;
    border-radius: 40;
  }
</style>

<script>
  var userTrack = weex.requireModule('userTrack');
  module.exports = {
      props: {
          title: {
            default: "COCOON/可可尼2017夏装新品甜美彩绘印花无袖修身连衣裙"
          },
          itemId: {
            default: 545194660752
          },
          shop: {
            default: "测试旗舰店"
          },
          pic: {
            default: "https://img.alicdn.com/bao/uploaded/i1/468333872/TB2ZpPse8NkpuFjy0FaXXbRCVXa_!!468333872.jpg_b.jpg"
          },
          sold: {
            default: "1050"
          },
          price: {
            default: "102.0"
          }
      },
      created: function() {
          console.log('created');
      },
      methods: {
          detailClick: function (url) {
            if (userTrack) {
                try {
                    var args = {};
                    userTrack.commitut("click", 2101, "Page_SearchResult", "CtrlName", null, null, null, args);
                } catch (e) {
                    console.error("commitUtExpose exception: ", e);
                }
            }
            var navigator = weex.requireModule('event');
            navigator.openURL("tmall://page.tm/itemDetail?itemId=" + this.itemId);
          },
          buyClick: function(e) {
              if (userTrack) {
                  try {
                    var args = {};
                    userTrack.commitut("click", 2101, "Page_SearchResult", "CtrlName", null, null, null, args);
                  } catch (err) {
                      console.error("commitUtExpose exception: ", err);
                  }
              }
              console.log('buy clicked.');
              var modal = weex.requireModule('modal');
              modal.toast({message: "Buy click.", duration: 0});
          }
      }
  };
</script>
