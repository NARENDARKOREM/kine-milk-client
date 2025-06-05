import "./App.css"; 
import SidebarMenu from "./common/StoreSidebar";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import ProductImagesAdd from "./components/ProductImages/ProductImagesAdd";
import ProductImagesList from "./components/ProductImages/ProductImagesList";
import CategoryAdd from "./Category/CategoryAdd";
import CategoryList from "./Category/CategoryList";
import RiderAdd from "./components/Rider/RiderAdd";
import ProductAdd from "./Product/ProductAdd";
import ProductList from "./Product/ProductList";
import RiderList from "./components/Rider/RiderList";
import TimeslotAdd from "./components/TimeSlot/TimeSlotAdd";
import TimeSlotList from "./components/TimeSlot/TimeSlotList";
import AdminSidebar from "./common/AdminSidebar";
import Login from "./components/Auth/Login";
import ProductAttributesAdd from "./Product Attributes/ProductAttributesAdd";
import DeliveryAdd from "./Deliveries/DeliveryAdd";
import ProductAttributesList from "./Product Attributes/ProductAttributesList";
import DeliveryList from "./Deliveries/DeliveryList";
import CouponAdd from "./components/Coupon/CouponAdd";
import CouponList from "./components/Coupon/CouponList";
import FaqAdd from "./Faq/FaqAdd";
import FaqList from "./Faq/FaqList";
import GalleryAdd from "./Gallery/GalleryAdd";
import GalleryList from "./Gallery/GalleryList";
import PendingOrders from "./components/NormalOrders/PendingOrders";
import CompletedOrder from "./components/NormalOrders/CompletedOrder";
import CancelledOrder from "./components/NormalOrders/CancelledOrder";
import SubPendingOrders from "./components/SubScriptionOrder/SubPendingOrders";
import SubCompletedOrder from "./components/SubScriptionOrder/SubCompletedOrder";
import SubCancelledOrder from "./components/SubScriptionOrder/SubCancelledOrder";
import Banner from "./Admin/Banner/Banner";
import BannerAdd from "./Admin/Banner/BannerAdd";
// import AdminCategoryList from "./Admin/Category/AdminCategoryList";
// import AdminCategoryAdd from "./Admin/Category/AdminCategoryAdd";
import AdminDeliveryZoneAdd from "./Admin/DeliveryZone/AdminDeliveryZoneAdd";
import Settings from "./Admin/Setting/Settings";
import AddStore from "./components/Store/AddStore";
import Storeslist from "./components/Store/Storeslist";
import ProductInventoryAdd from "./Store/ProductInventory/ProductInventoryAdd";
import PaymentGatewaylist from "./components/PaymentGateway/PaymentGatewaylist";
import UsersList from "./components/Users/UsersList";
import Account from "./components/Account/Account";
import AdminList from "./components/AddAdmin/AdminList";
import CreateAdminForm from "./components/AddAdmin/CreateAdminForm";
import ProductInventoryList from "./Store/ProductInventory/ProductInventoryList";
import StoreDashboard from "./components/Dashboard/StoreDashboard";
import StoreProtectedRoute from "./StoreProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoute";
import StoreAccount from "./components/Account/StoreAccount";
import NormalOrderReports from "./Reports/NormalOrderReports";
import SubscribeOrderReports from "./Reports/SubscribeOrderReports";
import NormalPaymentReports from "./Reports/NormalPaymentReports";
import SubscribePaymentReports from "./Reports/SubscribePaymentReports";
import StockReports from "./Reports/StockReports";
import RiderTimeslotAdd from "./components/Rider Timeslot/RiderTimeslotAdd";
import RiderTimeSlotList from "./components/Rider Timeslot/RiderTimeSlotList";
import AddUnitOptions from "./Admin/UnitOptions/AddUnitOptions";
import ListUnitOptions from "./Admin/UnitOptions/ListUnitOptions";
import InstantDeliveryboyReports from "./components/StoreReports/InstantDeliveryboyReports";
import SubscriptionDeliveryboyReports from "./components/StoreReports/SubscriptionDeliveryboyReports";

import NormalOrderReportsByStore from "./components/StoreReports/Store Order Reports/NormalOrderReportsByStore";
import SubscribeOrderReportsByStore from "./components/StoreReports/Store Order Reports/SubscribeOrderReportsByStore";
import NormalPaymentReportsByStore from "./components/StoreReports/Store Payment Reports/NormalPaymentReportsByStore";
import SubscribePaymentReportsByStore from "./components/StoreReports/Store Payment Reports/SubscribePaymentReportsByStore";
import SingleStoreStockReport from "./components/StoreReports/SingleStoreStockReport";
import CombinedDeliveryboyReports from "./components/StoreReports/InstantDeliveryboyReports";
import StoreWeightOptionList from "./Store/ProductInventory/StoreWeightOptionList";
import StoreWeightOptionAdd from "./Store/ProductInventory/StoreWeightOptionAdd";
import Productreviews from "./components/Reviews/Productreviews";
import IllustrationImageAdd from "./Admin/Illustration/IllustrationImageAdd";
import IllustrationImagesList from "./Admin/Illustration/IllustrationImagesList";
import AdsAdd from "./Admin/Ads/AdsAdd";
import AdsList from "./Admin/Ads/AdsList";
import CarryBagAdd from "./Admin/Carry_Bag/CarryBagAdd";
import CarryBagList from "./Admin/Carry_Bag/CarryBagList";


const LayoutWithSidebar = ({ children }) => (
  <div className="h-screen flex">
    <SidebarMenu />
    <div className="flex-1">{children}</div>
  </div>
);

const LayoutWithSidebaradmin = ({ children }) => (
  <div className="h-screen flex">
    <AdminSidebar />
    <div className="flex-1">{children}</div>
  </div>
);

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path="/*" element={<NotFound />} /> */}

          {/* Store Routes */}
          <Route path="/store/dashboard" element={<StoreProtectedRoute><LayoutWithSidebar><StoreDashboard /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/account" element={<StoreProtectedRoute><LayoutWithSidebar><StoreAccount /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-product-images" element={<StoreProtectedRoute><LayoutWithSidebar><ProductImagesAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/product-images-list" element={<StoreProtectedRoute><LayoutWithSidebar><ProductImagesList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-category" element={<StoreProtectedRoute><LayoutWithSidebar><CategoryAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/category-list" element={<StoreProtectedRoute><LayoutWithSidebar><CategoryList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-product-attribute" element={<StoreProtectedRoute><LayoutWithSidebar><ProductAttributesAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/product-attribute-list" element={<StoreProtectedRoute><LayoutWithSidebar><ProductAttributesList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-delivery" element={<StoreProtectedRoute><LayoutWithSidebar><DeliveryAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/delivery-list" element={<StoreProtectedRoute><LayoutWithSidebar><DeliveryList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-coupon" element={<StoreProtectedRoute><LayoutWithSidebar><CouponAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/coupon-list" element={<StoreProtectedRoute><LayoutWithSidebar><CouponList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-gallery" element={<StoreProtectedRoute><LayoutWithSidebar><GalleryAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/gallery-list" element={<StoreProtectedRoute><LayoutWithSidebar><GalleryList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-rider" element={<StoreProtectedRoute><LayoutWithSidebar><RiderAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/rider-list" element={<StoreProtectedRoute><LayoutWithSidebar><RiderList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-timeslot" element={<StoreProtectedRoute><LayoutWithSidebar><TimeslotAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/rider-timeslot" element={<StoreProtectedRoute><LayoutWithSidebar><TimeSlotList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/addrider-timeslot" element={<StoreProtectedRoute><LayoutWithSidebar><RiderTimeslotAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/listrider-timeslot" element={<StoreProtectedRoute><LayoutWithSidebar><RiderTimeSlotList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-productinv" element={<StoreProtectedRoute><LayoutWithSidebar><ProductInventoryAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/productinv-list" element={<StoreProtectedRoute><LayoutWithSidebar><ProductInventoryList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/inventory/:product_inventory_id" element={<StoreProtectedRoute><LayoutWithSidebar><StoreWeightOptionList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-weight-option/:product_inventory_id" element={<StoreProtectedRoute><LayoutWithSidebar><StoreWeightOptionAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/pending-order" element={<StoreProtectedRoute><LayoutWithSidebar><PendingOrders /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/completed-order" element={<StoreProtectedRoute><LayoutWithSidebar><CompletedOrder /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/cancelled-order" element={<StoreProtectedRoute><LayoutWithSidebar><CancelledOrder /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/subpending-order" element={<StoreProtectedRoute><LayoutWithSidebar><SubPendingOrders /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/subcompleted-order" element={<StoreProtectedRoute><LayoutWithSidebar><SubCompletedOrder /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/subcancelled-order" element={<StoreProtectedRoute><LayoutWithSidebar><SubCancelledOrder /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/add-product" element={<StoreProtectedRoute><LayoutWithSidebar><ProductAdd /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/product-list" element={<StoreProtectedRoute><LayoutWithSidebar><ProductList /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="store/InstantDeliveryboyReports" element={<StoreProtectedRoute><LayoutWithSidebar><CombinedDeliveryboyReports /></LayoutWithSidebar></StoreProtectedRoute>} />
          {/* <Route path="store/SubscriptionDeliveryboyReports" element={<StoreProtectedRoute><LayoutWithSidebar><SubscriptionDeliveryboyReports /></LayoutWithSidebar></StoreProtectedRoute>} /> */}
          <Route path="/store/InstantOrderReports" element={<StoreProtectedRoute><LayoutWithSidebar><NormalOrderReportsByStore /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/SubscriptionOrderReports" element={<StoreProtectedRoute><LayoutWithSidebar><SubscribeOrderReportsByStore /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/InstantPaymentReports" element={<StoreProtectedRoute><LayoutWithSidebar><NormalPaymentReportsByStore /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/SubscriptionPaymentReports" element={<StoreProtectedRoute><LayoutWithSidebar><SubscribePaymentReportsByStore /></LayoutWithSidebar></StoreProtectedRoute>} />
          <Route path="/store/StoreStockReports" element={<StoreProtectedRoute><LayoutWithSidebar><SingleStoreStockReport /></LayoutWithSidebar></StoreProtectedRoute>} />
          

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Dashboard /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/settings" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Settings /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/banner-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Banner /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-illustration" element={<AdminProtectedRoute><LayoutWithSidebaradmin><IllustrationImageAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/list-illustration" element={<AdminProtectedRoute><LayoutWithSidebaradmin><IllustrationImagesList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-banner" element={<AdminProtectedRoute><LayoutWithSidebaradmin><BannerAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-ads" element={<AdminProtectedRoute><LayoutWithSidebaradmin><AdsAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/list-ads" element={<AdminProtectedRoute><LayoutWithSidebaradmin><AdsList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-carrybag" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CarryBagAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/list-carrybag" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CarryBagList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/category-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CategoryList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-category" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CategoryAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          {/* <Route path="/admin/add-deliveryzone" element={<AdminProtectedRoute><LayoutWithSidebaradmin><AdminDeliveryZoneAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} /> */}
          <Route path="/admin/add-product-images" element={<AdminProtectedRoute><LayoutWithSidebaradmin><ProductImagesAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/product-images-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><ProductImagesList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/reviews" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Productreviews /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-faq" element={<AdminProtectedRoute><LayoutWithSidebaradmin><FaqAdd/></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/faq-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><FaqList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />

          <Route path="/admin/add-coupon" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CouponAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/coupon-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CouponList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-product" element={<AdminProtectedRoute><LayoutWithSidebaradmin><ProductAdd /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/product-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><ProductList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-store" element={<AdminProtectedRoute><LayoutWithSidebaradmin><AddStore /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/store-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Storeslist /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/list-payout" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Storeslist /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/payementgateway" element={<AdminProtectedRoute><LayoutWithSidebaradmin><PaymentGatewaylist /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/userlist" element={<AdminProtectedRoute><LayoutWithSidebaradmin><UsersList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/Account" element={<AdminProtectedRoute><LayoutWithSidebaradmin><Account /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/adminlist" element={<AdminProtectedRoute><LayoutWithSidebaradmin><AdminList /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-admin" element={<AdminProtectedRoute><LayoutWithSidebaradmin><CreateAdminForm /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/NormalOrderReports" element={<AdminProtectedRoute><LayoutWithSidebaradmin><NormalOrderReports /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/SubscribeOrderReports" element={<AdminProtectedRoute><LayoutWithSidebaradmin><SubscribeOrderReports /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/NormalPaymentReports" element={<AdminProtectedRoute><LayoutWithSidebaradmin><NormalPaymentReports /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/SubscribePaymentReports" element={<AdminProtectedRoute><LayoutWithSidebaradmin><SubscribePaymentReports /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/StockReports" element={<AdminProtectedRoute><LayoutWithSidebaradmin><StockReports /></LayoutWithSidebaradmin></AdminProtectedRoute>} />
          <Route path="/admin/add-weight-volume" element={<AdminProtectedRoute><LayoutWithSidebaradmin><AddUnitOptions/></LayoutWithSidebaradmin></AdminProtectedRoute>}/>
          <Route path="/admin/weight-volume-list" element={<AdminProtectedRoute><LayoutWithSidebaradmin><ListUnitOptions/></LayoutWithSidebaradmin></AdminProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;